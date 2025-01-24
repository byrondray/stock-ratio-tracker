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
  const [timeframe, setTimeframe] = useState('1Y');
  const API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY;

  const getStartDate = (timeframe: string) => {
    const now = new Date();
    switch (timeframe) {
      case '1M':
        return new Date(now.setMonth(now.getMonth() - 1));
      case '3M':
        return new Date(now.setMonth(now.getMonth() - 3));
      case '6M':
        return new Date(now.setMonth(now.getMonth() - 6));
      case '1Y':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      case '2Y':
        return new Date(now.setFullYear(now.getFullYear() - 2));
      case '5Y':
        return new Date(now.setFullYear(now.getFullYear() - 5));
      case 'ALL':
        return new Date('2010-01-01');
      default:
        return new Date(now.setFullYear(now.getFullYear() - 1));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const startDate = getStartDate(timeframe).toISOString().split('T')[0];
        const endDate = new Date().toISOString().split('T')[0];

        const goldRes = await axios.get(
          `https://api.polygon.io/v2/aggs/ticker/GLD/range/1/month/${startDate}/${endDate}?apiKey=${API_KEY}`
        );

        const silverRes = await axios.get(
          `https://api.polygon.io/v2/aggs/ticker/SLV/range/1/month/${startDate}/${endDate}?apiKey=${API_KEY}`
        );

        const lumberRes = await axios.get(
          `https://api.polygon.io/v2/aggs/ticker/WOOD/range/1/month/${startDate}/${endDate}?apiKey=${API_KEY}`
        );

        const processedData = goldRes.data.results.map(
          (
            item: { c: any; t: string | number | Date },
            index: string | number
          ) => {
            const goldPrice = item.c;
            const silverPrice = silverRes.data.results[index]?.c || 0;
            const lumberPrice = lumberRes.data.results[index]?.c || 0;

            return {
              date: new Date(item.t).toLocaleDateString(),
              goldSilverRatio: silverPrice
                ? ((goldPrice / silverPrice) * 10).toFixed(2)
                : 0,
              goldLumberRatio: lumberPrice
                ? ((goldPrice / lumberPrice) * 10).toFixed(2)
                : 0,
            };
          }
        );

        setData(processedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe]);

  if (loading) return <div>Loading...</div>;

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
