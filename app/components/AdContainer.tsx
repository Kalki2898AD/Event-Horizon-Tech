interface AdContainerProps {
  position: 'card' | 'article';
}

export default function AdContainer({ position }: AdContainerProps) {
  return (
    <div className={`
      w-full bg-gray-100 rounded-lg overflow-hidden
      ${position === 'card' ? 'h-[300px]' : 'h-[250px] my-8'}
    `}>
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-400 text-sm">
          Advertisement
        </div>
      </div>
    </div>
  );
}