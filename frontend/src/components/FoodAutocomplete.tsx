import { forwardRef, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

interface Suggestion {
  name: string
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  source: 'cache' | 'usda'
  hitCount?: number
}

interface SuggestionsResponse {
  frequent: Suggestion[]
  catalog: Suggestion[]
  related?: Suggestion[]
}

interface Props {
  value: string
  onChange: (value: string) => void
  onSelect: (item: Suggestion) => void
  onEnter?: () => void
  placeholder?: string
}

function highlight(text: string, query: string) {
  if (!query) return <span>{text}</span>
  const index = text.toLowerCase().indexOf(query.toLowerCase())
  if (index === -1) return <span>{text}</span>

  return (
    <span>
      {text.slice(0, index)}
      <mark className="bg-amber-200 dark:bg-amber-700 text-inherit rounded-sm">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </span>
  )
}

export const FoodAutocomplete = forwardRef<HTMLInputElement, Props>(function FoodAutocomplete({
  value,
  onChange,
  onSelect,
  onEnter,
  placeholder,
}, forwardedRef) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedQuery(value), 300)
    return () => window.clearTimeout(timeoutId)
  }, [value])

  const { data, isFetching } = useQuery<SuggestionsResponse>({
    queryKey: ['food-suggestions', debouncedQuery],
    queryFn: () => api.get(`/food-logs/suggestions?q=${encodeURIComponent(debouncedQuery)}&limit=8`).then(response => response.data),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 5 * 60_000,
  })

  const allItems = [
    ...(data?.frequent ?? []),
    ...(data?.catalog ?? []),
    ...(data?.related ?? []),
  ]

  useEffect(() => {
    setActiveIndex(-1)
  }, [debouncedQuery])

  const selectItem = (item: Suggestion) => {
    onChange(item.name)
    onSelect(item)
    setOpen(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false)
      return
    }
    if (inputSettled && !isFetching && open && allItems.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex(index => Math.min(index + 1, allItems.length - 1))
        return
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex(index => Math.max(index - 1, -1))
        return
      }
      if (event.key === 'Enter' && activeIndex >= 0) {
        event.preventDefault()
        selectItem(allItems[activeIndex])
        return
      }
    }
    if (event.key === 'Enter' && onEnter) {
      event.preventDefault()
      onEnter()
    }
  }

  const inputSettled = value.trim() === debouncedQuery.trim()
  const showDropdown = open && value.trim().length >= 2

  useEffect(() => {
    if (!showDropdown) return

    const positionDropdown = () => {
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const margin = 12
      const gap = 8
      const preferredWidth = 340
      const minimumSideWidth = 270
      const roomRight = window.innerWidth - rect.right - margin - gap
      const roomLeft = rect.left - margin - gap

      if (roomRight >= minimumSideWidth) {
        const width = Math.min(preferredWidth, roomRight)
        const top = Math.max(margin, Math.min(rect.top, window.innerHeight - 332))
        setDropdownStyle({
          left: rect.right + gap,
          top,
          width,
          maxHeight: Math.min(360, window.innerHeight - top - margin),
        })
        return
      }

      if (roomLeft >= minimumSideWidth) {
        const width = Math.min(preferredWidth, roomLeft)
        const top = Math.max(margin, Math.min(rect.top, window.innerHeight - 332))
        setDropdownStyle({
          left: rect.left - gap - width,
          top,
          width,
          maxHeight: Math.min(360, window.innerHeight - top - margin),
        })
        return
      }

      const roomBelow = window.innerHeight - rect.bottom - margin - gap
      const roomAbove = rect.top - margin - gap
      const placeBelow = roomBelow >= roomAbove
      const width = Math.min(preferredWidth, window.innerWidth - margin * 2)
      const left = Math.max(margin, Math.min(rect.left, window.innerWidth - width - margin))
      const maxHeight = Math.max(96, Math.min(288, placeBelow ? roomBelow : roomAbove))
      setDropdownStyle({
        left,
        top: placeBelow ? rect.bottom + gap : rect.top - gap - maxHeight,
        width,
        maxHeight,
      })
    }

    positionDropdown()
    window.addEventListener('resize', positionDropdown)
    window.addEventListener('scroll', positionDropdown, true)
    return () => {
      window.removeEventListener('resize', positionDropdown)
      window.removeEventListener('scroll', positionDropdown, true)
    }
  }, [showDropdown])

  return (
    <div ref={containerRef} className="relative w-full sm:flex-1 sm:w-auto" onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false)
    }}>
      <input
        ref={forwardedRef}
        className="input w-full"
        value={value}
        onChange={event => {
          onChange(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? 'Ex: Poulet grillé'}
        autoComplete="off"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listboxId}
        aria-autocomplete="list"
      />

      {showDropdown && createPortal(
        <div id={listboxId} role="listbox"
          style={dropdownStyle}
          className="fixed z-[70] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
          {(!inputSettled || isFetching) && (
            <div className="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400">
              Recherche nutritionnelle...
            </div>
          )}

          {inputSettled && !isFetching && allItems.length === 0 && (
            <div className="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400">
              Aucun aliment correspondant. Vous pouvez ajouter "{value}" manuellement.
            </div>
          )}

          {inputSettled && !isFetching && data?.frequent && data.frequent.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-b border-gray-100 dark:border-gray-700">
                Vos habitudes
              </div>
              {data.frequent.map((item, index) => (
                <SuggestionRow key={`frequent-${item.name}-${index}`} item={item} query={debouncedQuery}
                  active={activeIndex === index} onHover={() => setActiveIndex(index)}
                  onClick={() => selectItem(item)} />
              ))}
            </>
          )}

          {inputSettled && !isFetching && data?.catalog && data.catalog.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-b border-t border-gray-100 dark:border-gray-700">
                Résultats nutritionnels
              </div>
              {data.catalog.map((item, index) => {
                const itemIndex = (data.frequent?.length ?? 0) + index
                return (
                  <SuggestionRow key={`catalog-${item.name}-${index}`} item={item} query={debouncedQuery}
                    active={activeIndex === itemIndex} onHover={() => setActiveIndex(itemIndex)}
                    onClick={() => selectItem(item)} />
                )
              })}
            </>
          )}

          {inputSettled && !isFetching && data?.related && data.related.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 border-b border-t border-gray-100 dark:border-gray-700">
                Habitudes associées
              </div>
              {data.related.map((item, index) => {
                const itemIndex = (data.frequent?.length ?? 0) + (data.catalog?.length ?? 0) + index
                return (
                  <SuggestionRow key={`related-${item.name}-${index}`} item={item} query={debouncedQuery}
                    active={activeIndex === itemIndex} onHover={() => setActiveIndex(itemIndex)}
                    onClick={() => selectItem(item)} />
                )
              })}
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  )
})

function SuggestionRow({ item, query, active, onHover, onClick }: {
  item: Suggestion
  query: string
  active: boolean
  onHover: () => void
  onClick: () => void
}) {
  return (
    <button type="button" role="option" aria-selected={active}
      className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${active ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}
      onMouseDown={event => event.preventDefault()}
      onMouseEnter={onHover} onClick={onClick}>
      <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
        {highlight(item.name, query)}
      </span>
      <div className="flex items-center gap-2 shrink-0 text-xs text-gray-500 dark:text-gray-400">
        <span className="font-semibold text-amber-600 dark:text-amber-400">{item.calories} kcal</span>
        <span>P {item.proteinG.toFixed(1)}g</span>
      </div>
    </button>
  )
}
