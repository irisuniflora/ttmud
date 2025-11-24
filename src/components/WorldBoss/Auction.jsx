import React, { useState, useEffect } from 'react';
import { useGame } from '../../store/GameContext';
import { formatNumber } from '../../utils/formatter';
import {
  AUCTION_ITEMS,
  AUCTION_CONFIG,
  RARITY_COLORS
} from '../../data/worldBoss';

const Auction = () => {
  const { gameState, placeBid } = useGame();
  const { worldBoss = {}, sealedZone = {}, player } = gameState;
  const { auction = null } = worldBoss;
  const { bossCoins = 0 } = sealedZone;

  const [selectedItem, setSelectedItem] = useState(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  // 경매 타이머
  useEffect(() => {
    if (!auction || !auction.endTime) return;

    const interval = setInterval(() => {
      const remaining = auction.endTime - Date.now();
      setTimeLeft(Math.max(0, remaining));
    }, 1000);

    return () => clearInterval(interval);
  }, [auction]);

  // 시간 포맷팅
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

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

  if (!auction || !auction.active) {
    return (
      <div className="bg-game-panel border border-game-border rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🔨</div>
        <h3 className="text-xl font-bold text-gray-300 mb-2">경매가 진행 중이 아닙니다</h3>
        <p className="text-sm text-gray-400">
          월드보스 종료 후 경매가 시작됩니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
              <div className="text-2xl font-bold text-red-300">{formatTime(timeLeft)}</div>
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
          const hasEnded = timeLeft === 0;

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
    </div>
  );
};

export default Auction;
