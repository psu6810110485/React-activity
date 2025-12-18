import { useEffect, useMemo, useState } from 'react'
import { Divider, Spin } from 'antd'
import axios from 'axios'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const URL_BOOK = '/api/book'

export default function DashboardScreen() {
  const [bookData, setBookData] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchBooks = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(URL_BOOK)
      setBookData(data)
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  const categoryStats = useMemo(() => {
    const countsByCategory = new Map()

    for (const book of bookData) {
      const name = book?.category?.name ?? 'Unknown'
      countsByCategory.set(name, (countsByCategory.get(name) ?? 0) + 1)
    }

    const labels = Array.from(countsByCategory.keys())
    const values = labels.map((l) => countsByCategory.get(l) ?? 0)

    return { labels, values }
  }, [bookData])

  const barData = useMemo(() => {
    return {
      labels: categoryStats.labels,
      datasets: [
        {
          label: 'Books per Category',
          data: categoryStats.values,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
        },
      ],
    }
  }, [categoryStats])

  const barOptions = useMemo(() => {
    return {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Book Statistics' },
      },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } },
      },
    }
  }, [])

  return (
    <>
      <Divider>Dashboard</Divider>
      <Spin spinning={loading}>
        <Bar options={barOptions} data={barData} />
      </Spin>
    </>
  )
}
