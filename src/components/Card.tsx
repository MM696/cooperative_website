import Image from "next/image"

type CardProps = {
  title: string
  description: string
  img: string
}

export default function Card({ title, description, img }: CardProps) {
  return (
    <div className="rounded-2xl shadow-md bg-gray-100 dark:bg-neutral-800 overflow-hidden max-w-sm">
      <Image
        src={img}
        alt={title}
        width={400}
        height={250}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">{description}</p>
      </div>
    </div>
  )
}
