import { forwardRef, useEffect, useId, useState, type KeyboardEvent } from 'react'
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
  const listboxId = useId()

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedQuery(value), 300)
    return () => window.clearTimeout(timeoutId)
  }, [value])

  const { data } = useQuery<SuggestionsResponse>({
    queryKey: ['food-suggestions', debouncedQuery],
    queryFn: () => api.get(`/food-logs/suggestions?q=${encodeURIComponent(debouncedQuery)}&limit=8`).then(response => response.data),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 5 * 60_000,
  })

  const allItems = [
    ...(data?.frequent ?? []),
    ...(data?.catalog ?? []),
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
    if (open && allItems.length > 0) {
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

  const showDropdown = open && debouncedQuery.trim().length >= 2 && allItems.length > 0

  return (
    <div className="relative w-full sm:flex-1 sm:w-auto" onBlur={event => {
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

      {showDropdown && (
        <div id={listboxId} role="listbox"
          className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
          {data?.frequent && data.frequent.length > 0 && (
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

          {data?.catalog && data.catalog.length > 0 && (
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
        </div>
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
