import { useState, useEffect } from 'react'

export function useHomeData() {
  const [data, setData] = useState({ heroImages: [], galleryImages: [], loading: true })

  useEffect(() => {
    fetch('/api/home')
      .then((r) => r.json())
      .then((d) => setData({ heroImages: d.heroImages, galleryImages: d.galleryImages, loading: false }))
      .catch(() => setData((prev) => ({ ...prev, loading: false })))
  }, [])

  return data
}

export function useProjectData(slug) {
  const [data, setData] = useState({ project: null, loading: true })

  useEffect(() => {
    if (!slug) return
    fetch(`/api/project/${encodeURIComponent(slug)}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then((d) => setData({ project: d, loading: false }))
      .catch(() => setData({ project: null, loading: false }))
  }, [slug])

  return data
}
