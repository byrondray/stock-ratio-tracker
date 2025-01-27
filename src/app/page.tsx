'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from 'recharts';

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('1Y');
  const API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getStartDate = (timeframe: string) => {
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case '1M':
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        );
        break;
      case '3M':
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 3,
          now.getDate()
        );
        break;
      case '6M':
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 6,
          now.getDate()
        );
        break;
      case '1Y':
        startDate = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate()
        );
        break;
      case '2Y':
        startDate = new Date(
          now.getFullYear() - 2,
          now.getMonth(),
          now.getDate()
        );
        break;
      case '5Y':
        startDate = new Date(
          now.getFullYear() - 5,
          now.getMonth(),
          now.getDate()
        );
        break;
      case 'ALL':
        startDate = new Date('2010-01-01');
        break;
      default:
        startDate = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate()
        );
    }
    return formatDate(startDate.getTime());
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const startDate = getStartDate(timeframe);
        const endDate = formatDate(new Date().getTime());

        const fetchSymbolData = async (symbol: string) => {
          const response = await axios.get(
            `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/month/${startDate}/${endDate}`,
            {
              params: {
                apiKey: API_KEY,
              },
            }
          );
          return response.data;
        };

        const [goldRes, silverRes, lumberRes] = await Promise.all([
          fetchSymbolData('GLD'),
          fetchSymbolData('SLV'),
          fetchSymbolData('WOOD'),
        ]);

        if (!goldRes.results || !silverRes.results || !lumberRes.results) {
          throw new Error('Missing data for one or more symbols');
        }

        const processedData = goldRes.results.map(
          (item: { c: number; t: number }, index: number) => {
            const goldPrice = item.c;
            const silverPrice = silverRes.results[index]?.c || 0;
            const lumberPrice = lumberRes.results[index]?.c || 0;

            return {
              date: formatDate(item.t),
              goldSilverRatio: silverPrice
                ? ((goldPrice / silverPrice) * 10).toFixed(2)
                : '0',
              goldLumberRatio: lumberPrice
                ? ((goldPrice / lumberPrice) * 10).toFixed(2)
                : '0',
            };
          }
        );

        setData(processedData);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe, API_KEY]);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='text-red-500 text-center p-4'>
          <h2 className='text-xl font-bold mb-2'>Error</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='p-4 h-screen space-y-8'>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-2xl font-bold'>Commodity Ratios</h1>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className='p-2 border rounded text-black font-medium'
        >
          <option value='1M'>1 Month</option>
          <option value='3M'>3 Months</option>
          <option value='6M'>6 Months</option>
          <option value='1Y'>1 Year</option>
          <option value='2Y'>2 Years</option>
          <option value='5Y'>5 Years</option>
          <option value='ALL'>All Time</option>
        </select>
      </div>

      <div className='h-[400px]'>
        <h2 className='text-xl mb-2'>Gold/Silver Ratio</h2>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='date' allowDataOverflow={true} />
            <YAxis allowDataOverflow={true} />
            <Tooltip contentStyle={{ color: 'black', fontWeight: 500 }} />
            <Legend />
            <Line
              type='monotone'
              dataKey='goldSilverRatio'
              stroke='#8884d8'
              name='Gold/Silver Ratio'
            />
            <Brush dataKey='date' height={30} stroke='#8884d8' />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className='h-[400px]'>
        <h2 className='text-xl mb-2'>Gold/Lumber Ratio</h2>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='date' allowDataOverflow={true} />
            <YAxis allowDataOverflow={true} />
            <Tooltip contentStyle={{ color: 'black', fontWeight: 500 }} />
            <Legend />
            <Line
              type='monotone'
              dataKey='goldLumberRatio'
              stroke='#82ca9d'
              name='Gold/Lumber Ratio'
            />
            <Brush dataKey='date' height={30} stroke='#82ca9d' />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
