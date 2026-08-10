import type { ReactNode } from 'react'

/** Distinguishes "nothing here yet" from "your search matched nothing". */
export function Empty({ search, noun, hint }: { search: string; noun: string; hint: string }) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="m-0 text-[15.04px] font-medium leading-[23px] text-ink">
        {search ? `No ${noun} match “${search}”` : `No ${noun} yet`}
      </p>
      <p className="m-0 mx-auto mt-1 max-w-[46ch] text-[12.96px] leading-[20px] text-muted">
        {search ? 'Clear the search to see everything here.' : hint}
      </p>
    </div>
  )
}

/**
 * `drop` lists the column indexes that give way as the column narrows, in the
 * order they go: the title is never the thing that gets crushed to "Creatin…".
 */
export function Table({
  headers,
  drop = [],
  children,
}: {
  headers: string[]
  drop?: number[]
  children: ReactNode
}) {
  return (
    <table className="w-full table-fixed border-collapse">
      <thead>
        <tr className="border-b border-line">
          {headers.map((header, i) => (
            <th
              key={header}
              className={`px-4 py-3 text-left text-[15.04px] font-medium leading-[23px] text-ink
                ${i === 0 ? 'w-[42%] @max-[520px]:w-auto' : ''} ${dropClass(drop.indexOf(i))}`}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  )
}

/** First to go at 640px, then 520px, then 430px. */
function dropClass(order: number) {
  if (order === 0) return '@max-[640px]:hidden'
  if (order === 1) return '@max-[520px]:hidden'
  if (order === 2) return '@max-[430px]:hidden'
  return ''
}

export function Row({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <tr onClick={onClick} className="group/row cursor-pointer border-b border-line hover:bg-rail">
      {children}
    </tr>
  )
}

export function Cell({
  children,
  bold,
  muted,
  drop,
}: {
  children: ReactNode
  bold?: boolean
  muted?: boolean
  drop?: number
}) {
  return (
    <td
      className={`truncate px-4 py-3 ${dropClass(drop ?? -1)} ${
        bold
          ? 'text-[15.04px] font-bold leading-[23px] text-ink'
          : muted
            ? 'text-[15.04px] leading-[23px] text-ink'
            : ''
      }`}
    >
      {children}
    </td>
  )
}
