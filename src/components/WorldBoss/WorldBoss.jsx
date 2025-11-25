import React, { useState, useEffect } from 'react';
import { useGame } from '../../store/GameContext';
import { formatNumber } from '../../utils/formatter';
import {
  WORLD_BOSS_INFO,
  WORLD_BOSS_CONFIG,
  isWorldBossActive,
  getTimeUntilNextBoss,
  getTimeUntilBossEnd,
  AUCTION_ITEMS,
  AUCTION_CONFIG,
  RARITY_COLORS
} from '../../data/worldBoss';

const WorldBoss = () => {
  const [activeSubTab, setActiveSubTab] = useState('boss'); // 'boss' 또는 'auction'
  const { gameState, startWorldBossBattle, placeBid, engine } = useGame();
  const { worldBoss = {}, player, sealedZone = {} } = gameState;
  const {
    isActive = false,
    manualOverride = null,
    battleSession = null,
    totalDamage = 0,
    rankings = [],
    lastRewardTime = null
  } = worldBoss;

  const [timeLeft, setTimeLeft] = useState(0);
  const [bossTimeLeft, setBossTimeLeft] = useState(0);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(0);

  // 경매 관련 상태
  const [selectedItem, setSelectedItem] = useState(null);
  const [bidAmount, setBidAmount] = useState(0);
  const { bossCoins = 0 } = sealedZone;
  const { auction = null } = worldBoss;

  // 월드보스 활성화 상태 확인
  const bossActive = isWorldBossActive(new Date(), manualOverride);

  // 타이머 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      if (bossActive) {
        setBossTimeLeft(getTimeUntilBossEnd());
      } else {
        setTimeLeft(getTimeUntilNextBoss());
      }

      // 전투 세션 타이머
      if (battleSession && battleSession.endTime) {
        const remaining = battleSession.endTime - Date.now();
        setSessionTimeLeft(Math.max(0, remaining));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [bossActive, battleSession]);

  // 시간 포맷팅 (ms -> 시:분:초)
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}시간 ${minutes}분 ${seconds}초`;
    } else if (minutes > 0) {
      return `${minutes}분 ${seconds}초`;
    } else {
      return `${seconds}초`;
    }
  };

  // 전투 시작
  const handleStartBattle = () => {
    if (!bossActive) {
      alert('월드보스가 활성화되지 않았습니다!');
      return;
    }

    if (battleSession && sessionTimeLeft > 0) {
      alert('이미 전투 중입니다!');
      return;
    }

    const result = startWorldBossBattle();
    if (!result.success) {
      alert(result.message || '전투 시작에 실패했습니다!');
    }
  };

  // 내 랭킹 찾기
  const myRanking = rankings.findIndex(r => r.playerId === player.id) + 1;
  const myDamage = rankings.find(r => r.playerId === player.id)?.damage || 0;

  // 입찰하기
  const handlePlaceBid = (itemId) => {
    if (bidAmount <= 0) {
      alert('입찰 금액을 입력해주세요!');
      return;
    }

    const currentBid = auction.items[itemId]?.currentBid || 0;
    if (bidAmount <= currentBid) {
      alert(`현재 최고 입찰가(${formatNumber(currentBid)})보다 높은 금액을 입력해주세요!`);
      return;
    }

    if (bidAmount > bossCoins) {
      alert('보스 코인이 부족합니다!');
      return;
    }

    const result = placeBid(itemId, bidAmount, player.id, player.name || `플레이어 ${player.id}`);
    if (result.success) {
      alert('입찰에 성공했습니다!');
      setSelectedItem(null);
      setBidAmount(0);
    } else {
      alert(result.message);
    }
  };

  // 경매 타이머
  const [auctionTimeLeft, setAuctionTimeLeft] = useState(0);
  useEffect(() => {
    if (!auction || !auction.endTime) return;

    const interval = setInterval(() => {
      const remaining = auction.endTime - Date.now();
      setAuctionTimeLeft(Math.max(0, remaining));
    }, 1000);

    return () => clearInterval(interval);
  }, [auction]);

  return (
    <div className="space-y-4">
      {/* 서브 탭 메뉴 */}
      <div className="flex gap-2 bg-gray-900 p-2 rounded-lg border border-gray-700">
        <button
          onClick={() => setActiveSubTab('boss')}
          className={`flex-1 px-4 py-2 rounded font-bold transition-all ${
            activeSubTab === 'boss'
              ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          👹 월드보스
        </button>
        <button
          onClick={() => setActiveSubTab('auction')}
          className={`flex-1 px-4 py-2 rounded font-bold transition-all ${
            activeSubTab === 'auction'
              ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-md'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          🔨 경매
        </button>
      </div>

      {/* 월드보스 탭 */}
      {activeSubTab === 'boss' && (
        <>
          {/* 월드보스 헤더 */}
          <div className="bg-gradient-to-r from-purple-900 to-red-900 border border-red-500 rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-5xl">{WORLD_BOSS_INFO.icon}</div>
            <div>
              <h2 className="text-2xl font-bold text-red-400">{WORLD_BOSS_INFO.name}</h2>
              <p className="text-sm text-gray-300">{WORLD_BOSS_INFO.description}</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg border-2 ${
            bossActive
              ? 'bg-green-900 border-green-500 text-green-300'
              : 'bg-gray-800 border-gray-600 text-gray-400'
          }`}>
            <div className="text-center">
              <div className="text-xs mb-1">{bossActive ? '활성화' : '비활성화'}</div>
              <div className="text-lg font-bold">
                {bossActive ? formatTime(bossTimeLeft) : formatTime(timeLeft)}
              </div>
              <div className="text-xs">{bossActive ? '종료까지' : '시작까지'}</div>
            </div>
          </div>
        </div>

        {/* 보스 특성 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
          {WORLD_BOSS_INFO.traits.map((trait, index) => (
            <div key={index} className="bg-black bg-opacity-40 rounded p-2 border border-purple-700">
              <div className="text-xs font-bold text-purple-400">{trait.name}</div>
              <div className="text-xs text-gray-300">{trait.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 전투 영역 */}
      {bossActive ? (
        <div className="bg-game-panel border border-game-border rounded-lg p-4">
          {/* 전투 세션 정보 */}
          {battleSession && sessionTimeLeft > 0 ? (
            <div className="mb-4">
              <div className="bg-red-900 bg-opacity-50 border border-red-500 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-red-400">⚔️ 전투 중</h3>
                  <div className="text-2xl font-bold text-red-300">
                    {Math.ceil(sessionTimeLeft / 1000)}초
                  </div>
                </div>

                {/* 실시간 데미지 */}
                <div className="bg-black bg-opacity-40 rounded p-3">
                  <div className="text-sm text-gray-300 mb-1">누적 데미지</div>
                  <div className="text-3xl font-bold text-yellow-400">
                    {formatNumber(battleSession.sessionDamage || 0)}
                  </div>
                </div>

                {/* 진행바 */}
                <div className="mt-3 bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-500 to-orange-500 h-full transition-all duration-1000"
                    style={{
                      width: `${((WORLD_BOSS_CONFIG.battleSession.duration * 1000 - sessionTimeLeft) / (WORLD_BOSS_CONFIG.battleSession.duration * 1000)) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <button
                onClick={handleStartBattle}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 border-2 border-red-400 rounded-lg font-bold text-white text-xl transition-all shadow-lg"
              >
                ⚔️ 전투 시작 ({WORLD_BOSS_CONFIG.battleSession.duration}초)
              </button>
            </div>
          )}

          {/* 내 전적 */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-4">
            <h4 className="text-sm font-bold text-gray-300 mb-2">📊 내 전적</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-900 rounded p-2">
                <div className="text-xs text-gray-400">순위</div>
                <div className="text-lg font-bold text-yellow-400">
                  {myRanking > 0 ? `${myRanking}위` : '기록 없음'}
                </div>
              </div>
              <div className="bg-gray-900 rounded p-2">
                <div className="text-xs text-gray-400">누적 데미지</div>
                <div className="text-lg font-bold text-red-400">
                  {formatNumber(myDamage)}
                </div>
              </div>
            </div>
          </div>

          {/* 랭킹 */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-300">🏆 실시간 랭킹</h4>
              <div className="text-xs text-gray-400">
                총 참가자: {rankings.length}명
              </div>
            </div>

            {rankings.length > 0 ? (
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {rankings.slice(0, 50).map((rank, index) => (
                  <div
                    key={rank.playerId}
                    className={`flex items-center justify-between p-2 rounded ${
                      rank.playerId === player.id
                        ? 'bg-blue-900 bg-opacity-50 border border-blue-500'
                        : index < 10
                        ? 'bg-yellow-900 bg-opacity-30'
                        : 'bg-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`text-sm font-bold w-8 ${
                        index === 0 ? 'text-yellow-400' :
                        index === 1 ? 'text-gray-400' :
                        index === 2 ? 'text-orange-400' :
                        index < 10 ? 'text-purple-400' :
                        'text-gray-500'
                      }`}>
                        {index === 0 ? '🥇' :
                         index === 1 ? '🥈' :
                         index === 2 ? '🥉' :
                         `${index + 1}위`}
                      </div>
                      <div className="text-sm text-gray-200">{rank.playerName || `플레이어 ${rank.playerId}`}</div>
                    </div>
                    <div className="text-sm font-bold text-red-400">
                      {formatNumber(rank.damage)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                아직 참가자가 없습니다
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-game-panel border border-game-border rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-bold text-gray-300 mb-2">월드보스가 비활성화되었습니다</h3>
          <p className="text-sm text-gray-400 mb-4">
            매일 오전 12시부터 낮 12시까지 도전할 수 있습니다
          </p>
          <div className="text-lg font-bold text-blue-400">
            다음 오픈까지: {formatTime(timeLeft)}
          </div>
        </div>
      )}

      {/* 보상 정보 */}
      <div className="bg-game-panel border border-game-border rounded-lg p-4">
        <h3 className="text-lg font-bold text-gray-100 mb-3">🎁 보상 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-gradient-to-r from-yellow-900 to-orange-900 border border-yellow-500 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-2xl">🏆</div>
              <div>
                <div className="text-sm font-bold text-yellow-400">TOP 10</div>
                <div className="text-xs text-gray-300">상위 10명</div>
              </div>
            </div>
            <div className="text-xl font-bold text-yellow-300">
              🪙 {WORLD_BOSS_CONFIG.rewards.top10.bossCoins} 보스코인
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-500 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-2xl">🎖️</div>
              <div>
                <div className="text-sm font-bold text-gray-300">참가상</div>
                <div className="text-xs text-gray-400">11위 이하</div>
              </div>
            </div>
            <div className="text-xl font-bold text-gray-200">
              🪙 {WORLD_BOSS_CONFIG.rewards.participation.bossCoins} 보스코인
            </div>
          </div>
        </div>

        <div className="mt-3 bg-blue-900 bg-opacity-30 border border-blue-700 rounded p-2">
          <div className="text-xs text-blue-300">
            💡 보상은 월드보스 종료 시 자동으로 지급되며, 경매 아이템 획득 기회가 주어집니다!
          </div>
        </div>
      </div>
        </>
      )}

      {/* 경매 탭 */}
      {activeSubTab === 'auction' && (
        <>
          {!auction || !auction.active ? (
            <div className="bg-game-panel border border-game-border rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">🔨</div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">경매가 진행 중이 아닙니다</h3>
              <p className="text-sm text-gray-400">
                월드보스 종료 후 경매가 시작됩니다
              </p>
            </div>
          ) : (
            <>
              {/* 경매 헤더 */}
              <div className="bg-gradient-to-r from-yellow-900 to-orange-900 border border-yellow-500 rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">🔨</div>
                    <div>
                      <h2 className="text-2xl font-bold text-yellow-400">희귀 아이템 경매</h2>
                      <p className="text-sm text-gray-300">보스 코인으로 입찰하여 희귀 아이템을 획득하세요</p>
                    </div>
                  </div>
                  <div className="bg-red-900 border-2 border-red-500 rounded-lg px-4 py-2">
                    <div className="text-center">
                      <div className="text-xs text-gray-300 mb-1">경매 종료까지</div>
                      <div className="text-2xl font-bold text-red-300">
                        {Math.floor(auctionTimeLeft / 60000)}:{String(Math.floor((auctionTimeLeft % 60000) / 1000)).padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 보유 코인 */}
                <div className="mt-3 bg-black bg-opacity-40 rounded p-2 flex items-center justify-between">
                  <span className="text-sm text-gray-300">보유 보스코인</span>
                  <span className="text-lg font-bold text-yellow-400">🪙 {formatNumber(bossCoins)}</span>
                </div>
              </div>

              {/* 경매 아이템 목록 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(auction.items).map(([itemId, auctionData]) => {
                  const itemInfo = AUCTION_ITEMS.find(i => i.id === itemId);
                  if (!itemInfo) return null;

                  const isMyBid = auctionData.highestBidder === player.id;
                  const hasEnded = auctionTimeLeft === 0;

                  return (
                    <div
                      key={itemId}
                      className={`bg-gray-800 border-2 ${RARITY_COLORS[itemInfo.rarity]} rounded-lg p-4 ${
                        isMyBid ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      {/* 아이템 헤더 */}
                      <div className="flex items-center mb-3">
                        <div className="text-4xl mr-3">{itemInfo.icon}</div>
                        <div className="flex-1">
                          <h3 className={`text-lg font-bold ${RARITY_COLORS[itemInfo.rarity]}`}>
                            {itemInfo.name}
                          </h3>
                          <p className="text-xs text-gray-400">{itemInfo.description}</p>
                          <div className="text-xs text-gray-500 mt-1">
                            수량: {auctionData.quantity}개
                          </div>
                        </div>
                      </div>

                      {/* 현재 입찰 정보 */}
                      <div className="bg-gray-900 rounded p-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">현재 최고가</span>
                          <span className="text-lg font-bold text-yellow-400">
                            🪙 {formatNumber(auctionData.currentBid)}
                          </span>
                        </div>
                        {auctionData.highestBidder && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">최고 입찰자</span>
                            <span className={`text-xs font-bold ${
                              isMyBid ? 'text-blue-400' : 'text-gray-300'
                            }`}>
                              {isMyBid ? '나' : (auctionData.highestBidderName || '익명')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 입찰 버튼 */}
                      {!hasEnded ? (
                        <button
                          onClick={() => {
                            setSelectedItem(itemId);
                            setBidAmount(auctionData.currentBid + AUCTION_CONFIG.bidding.minIncrement);
                          }}
                          disabled={isMyBid}
                          className={`w-full py-2 rounded font-bold transition-colors ${
                            isMyBid
                              ? 'bg-blue-900 text-blue-300 cursor-default'
                              : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          }`}
                        >
                          {isMyBid ? '✓ 최고 입찰자' : '입찰하기'}
                        </button>
                      ) : (
                        <div className={`w-full py-2 rounded font-bold text-center ${
                          isMyBid
                            ? 'bg-green-900 text-green-300'
                            : 'bg-gray-700 text-gray-500'
                        }`}>
                          {isMyBid ? '🎉 낙찰!' : '경매 종료'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 입찰 모달 */}
              {selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                  <div className="bg-gray-900 border-2 border-yellow-500 rounded-lg p-6 max-w-md w-full mx-4">
                    {(() => {
                      const itemInfo = AUCTION_ITEMS.find(i => i.id === selectedItem);
                      const auctionData = auction.items[selectedItem];

                      return (
                        <>
                          <h3 className="text-xl font-bold text-yellow-400 mb-4">
                            {itemInfo.icon} {itemInfo.name} 입찰
                          </h3>

                          <div className="mb-4">
                            <div className="bg-gray-800 rounded p-3 mb-3">
                              <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-400">현재 최고가</span>
                                <span className="text-lg font-bold text-yellow-400">
                                  🪙 {formatNumber(auctionData.currentBid)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-400">최소 입찰가</span>
                                <span className="text-sm font-bold text-gray-300">
                                  🪙 {formatNumber(auctionData.currentBid + AUCTION_CONFIG.bidding.minIncrement)}
                                </span>
                              </div>
                            </div>

                            <label className="block text-sm text-gray-300 mb-2">입찰 금액</label>
                            <input
                              type="number"
                              value={bidAmount}
                              onChange={(e) => setBidAmount(parseInt(e.target.value) || 0)}
                              min={auctionData.currentBid + AUCTION_CONFIG.bidding.minIncrement}
                              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-lg"
                            />

                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={() => setBidAmount(auctionData.currentBid + AUCTION_CONFIG.bidding.minIncrement)}
                                className="flex-1 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300"
                              >
                                최소가
                              </button>
                              <button
                                onClick={() => setBidAmount(auctionData.currentBid + 100)}
                                className="flex-1 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300"
                              >
                                +100
                              </button>
                              <button
                                onClick={() => setBidAmount(auctionData.currentBid + 500)}
                                className="flex-1 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300"
                              >
                                +500
                              </button>
                            </div>

                            <div className="mt-3 bg-blue-900 bg-opacity-30 border border-blue-700 rounded p-2">
                              <div className="text-xs text-blue-300">
                                💡 입찰 시 코인이 즉시 차감되며, 다른 사람이 더 높은 금액으로 입찰하면 반환됩니다.
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedItem(null);
                                setBidAmount(0);
                              }}
                              className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded font-bold text-white"
                            >
                              취소
                            </button>
                            <button
                              onClick={() => handlePlaceBid(selectedItem)}
                              className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 rounded font-bold text-white"
                            >
                              입찰하기
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* 입찰 규칙 */}
              <div className="bg-game-panel border border-game-border rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-100 mb-3">📋 경매 규칙</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• 경매는 {AUCTION_CONFIG.duration / 60}분간 진행됩니다</li>
                  <li>• 최소 입찰 증가액은 {AUCTION_CONFIG.bidding.minIncrement} 보스코인입니다</li>
                  <li>• 입찰 시 코인이 즉시 차감되며, 다른 사람이 더 높은 금액으로 입찰하면 반환됩니다</li>
                  <li>• 경매 종료 시 최고 입찰자가 아이템을 획득합니다</li>
                  <li>• 동일한 아이템이 여러 개인 경우, 상위 입찰자 순서대로 분배됩니다</li>
                </ul>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default WorldBoss;
