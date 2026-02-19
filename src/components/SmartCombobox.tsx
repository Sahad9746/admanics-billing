'use client'

import { useState, useRef, useEffect } from "react"

interface SmartComboboxProps {
  name: string
  label: string
  options: { id: string, name: string }[]
  initialId?: string
  placeholder?: string
  required?: boolean
}

export function SmartCombobox({ name, label, options, initialId, placeholder, required }: SmartComboboxProps) {
  const initialOption = options.find(o => o.id === initialId)
  const [val, setVal] = useState(initialOption ? initialOption.name : '')
  const [show, setShow] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // If options load asynchronously and we find the initial option later
    if (!val && initialId) {
      const opt = options.find(o => o.id === initialId)
      if (opt) setVal(opt.name)
    }
  }, [options, initialId, val])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShow(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const matchedOption = options.find(o => o.name.toLowerCase() === val.toLowerCase())
  const finalValue = matchedOption ? matchedOption.id : (val ? `new:${val}` : '')

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-neutral-400 mb-1.5">{label}</label>
      {/* 
        If required is true and finalValue is empty, the hidden input will technically not block form submission 
        unless handled carefully. But the visible input has required.
      */}
      <input type="hidden" name={name} value={finalValue} />
      <input
        type="text"
        value={val}
        onChange={(e) => {
          setVal(e.target.value)
          setShow(true)
        }}
        onFocus={() => setShow(true)}
        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
        placeholder={placeholder}
        autoComplete="off"
        required={required}
      />
      {show && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-50 p-1 max-h-48 overflow-y-auto">
          {options.filter(o => o.name.toLowerCase().includes(val.toLowerCase())).map(o => (
            <div 
              key={o.id}
              onClick={() => {
                setVal(o.name)
                setShow(false)
              }} 
              className="cursor-pointer px-3 py-2 hover:bg-neutral-800 rounded-md text-white text-sm transition-colors"
            >
              {o.name}
            </div>
          ))}
          {val && !matchedOption && (
            <div 
                className="px-3 py-2 text-neutral-400 text-sm italic cursor-pointer hover:bg-neutral-800 rounded-md transition-colors"
                onClick={() => setShow(false)}
            >
              Press save to add "{val}"
            </div>
          )}
          {!val && options.length === 0 && (
             <div className="px-3 py-2 text-neutral-500 text-sm">Type to search or create...</div>
          )}
        </div>
      )}
    </div>
  )
}
