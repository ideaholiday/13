import { PortableText } from '@portabletext/react'

export default function PortableBody({ value }: { value: any }) {
  return (
    <div className="prose max-w-none">
      <PortableText value={value} />
    </div>
  )
}
