const RADIUS = 20

interface LoaderProps {
  stroke: number
  secondaryColor: string
  strokeColor?: string
  compact?: boolean
  width?: number
}

export default function Loader(props: LoaderProps) {
  const width = props.width ? props.width : props.compact ? 60 : 80
  const { stroke = 8, secondaryColor } = props
  return (
    <div aria-label="oval-loading">
      <svg
        width={width}
        height={width}
        viewBox={getViewBoxSize(Number(stroke), RADIUS)}
        xmlns="http://www.w3.org/2000/svg"
        className="xar-loader-circle"
        data-testid="oval-svg"
      >
        <g fill="none" fillRule="evenodd">
          <g
            transform="translate(1 1)"
            stroke-width={stroke}
            data-testid="oval-secondary-group"
          >
            <circle
              strokeOpacity=".5"
              cx="0"
              cy="0"
              r={RADIUS}
              stroke={secondaryColor}
              stroke-width={stroke}
              opacity={0.3}
            />
            <path d={getPath(RADIUS)} stroke={props.strokeColor}>
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 0 0"
                to="360 0 0"
                dur="1s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        </g>
      </svg>
    </div>
  )
}

const getViewBoxSize = (strokeWidth: number, radius: number) => {
  const startingPoint = -radius - strokeWidth / 2 + 1
  const endpoint = radius * 2 + strokeWidth
  return [startingPoint, startingPoint, endpoint, endpoint].join(' ')
}

const getPath = (radius: number) => {
  return ['M' + radius + ' 0c0-9.94-8.06', radius, radius, radius].join('-')
}
