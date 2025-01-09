import { useState } from "react";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";

/**
 * InteractiveGridPattern is a component that renders a grid pattern with interactive squares.
 *
 * @param {number} width - The width of each square.
 * @param {number} height - The height of each square.
 * @param {Array<number>} squares - The number of squares in the grid. The first element is the number of horizontal squares, and the second element is the number of vertical squares.
 * @param {string} className - The class name of the grid.
 * @param {string} squaresClassName - The class name of the squares.
 * @param {object} props - Additional props to pass to the `svg` element.
 * @returns {React.Element} The rendered component.
 */
export function InteractiveGridPattern({
  width = 40,
  height = 40,
  squares = [24, 24],
  className,
  squaresClassName,
  ...props
}) {
  const [horizontal, vertical] = squares;
  const [hoveredSquare, setHoveredSquare] = useState(null);

  return (
    <svg
      width={width * horizontal}
      height={height * vertical}
      className={cn(
        "absolute inset-0 h-full w-full border border-gray-400/30",
        className
      )}
      {...props}
    >
      {Array.from({ length: horizontal * vertical }).map((_, index) => {
        const x = (index % horizontal) * width;
        const y = Math.floor(index / horizontal) * height;
        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={width}
            height={height}
            className={cn(
              "stroke-gray-400/30 transition-all duration-100 ease-in-out [&:not(:hover)]:duration-1000",
              hoveredSquare === index ? "fill-gray-300/30" : "fill-transparent",
              squaresClassName
            )}
            onMouseEnter={() => setHoveredSquare(index)}
            onMouseLeave={() => setHoveredSquare(null)}
          />
        );
      })}
    </svg>
  );
}

InteractiveGridPattern.propTypes = {
  width: PropTypes.number, // Width of each square
  height: PropTypes.number, // Height of each square
  squares: PropTypes.arrayOf(PropTypes.number), // Array with horizontal and vertical square counts
  className: PropTypes.string, // Class name for the grid
  squaresClassName: PropTypes.string, // Class name for the squares
};
