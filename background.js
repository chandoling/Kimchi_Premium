// background.js

// 김치 프리미엄 계산 및 표시
async function calculateKimchiPremium() {
  try {
    // 1. 환율 정보 가져오기
    const exchangeRateResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const exchangeRateData = await exchangeRateResponse.json();
    const usdkrwRate = exchangeRateData.rates.KRW;

    // 2. Binance BTC 가격 가져오기 (USD)
    const binanceResponse = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
    const binanceData = await binanceResponse.json();
    const binancePriceUSD = parseFloat(binanceData.price); // Binance BTC 가격 (USD)

    // 3. Binance BTC 가격을 원화로 변환
    const binancePriceKRW = binancePriceUSD * usdkrwRate;

    // 4. Upbit BTC 가격 가져오기 (KRW)
    const upbitResponse = await fetch('https://api.upbit.com/v1/ticker?markets=KRW-BTC');
    const upbitData = await upbitResponse.json();
    const upbitPriceKRW = parseFloat(upbitData[0].trade_price); // Upbit BTC 가격 (KRW)

    // 5. 김치 프리미엄 계산
    const premium = ((upbitPriceKRW - binancePriceKRW) / binancePriceKRW) * 100;

    // 6. 소수점 한 자리까지 반올림
    const premiumRounded = premium.toFixed(1);

    // 7. 배지 업데이트
    chrome.action.setBadgeText({ text: premiumRounded });
    if (premium >= 0) {
      chrome.action.setBadgeBackgroundColor({ color: '#FFCCCC' }); // 양수: 연한 빨간색
    } else {
      chrome.action.setBadgeBackgroundColor({ color: '#CCCCFF' }); // 음수: 연한 파란색
    }
  } catch (error) {
    console.error('김치 프리미엄 계산 중 오류 발생:', error);
  }
}


// 초기화 함수
function init() {
  calculateKimchiPremium();

  // 김치 프리미엄은 1분마다 계산
  chrome.alarms.create('calculateKimchiPremium', { periodInMinutes: 1 });
}

// 알람 이벤트 리스너
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'calculateKimchiPremium') {
    calculateKimchiPremium();
  }
});

// 서비스 워커 시작 시 초기화
chrome.runtime.onStartup.addListener(init);

// 확장 프로그램 설치 또는 업데이트 시 초기화
chrome.runtime.onInstalled.addListener(init);
