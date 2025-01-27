// app/api/finnhub/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!symbol || !from || !to) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // First, test if we can get a quote for the symbol
    const quoteResponse = await axios.get('https://finnhub.io/api/v1/quote', {
      params: {
        symbol,
      },
      headers: {
        'X-Finnhub-Token': process.env.FINNHUB_API_KEY,
      },
    });

    console.log(`Quote data for ${symbol}:`, quoteResponse.data);

    // Then get the candle data
    const candleResponse = await axios.get(
      'https://finnhub.io/api/v1/stock/candle',
      {
        params: {
          symbol,
          resolution: 'D',
          from,
          to,
        },
        headers: {
          'X-Finnhub-Token': process.env.FINNHUB_API_KEY,
        },
      }
    );

    return NextResponse.json(candleResponse.data);
  } catch (error: any) {
    console.error('Finnhub API error:', error.response?.data || error.message);
    return NextResponse.json(
      {
        error:
          error.response?.data?.error || 'Failed to fetch data from Finnhub',
      },
      { status: error.response?.status || 500 }
    );
  }
}
