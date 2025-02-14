"use client";
import Image from "next/image";
import React, { useState } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";

export const AnimatedTooltip = ({
  items,
  className,
  selectedId,
  onSelect,
}: {
  items: {
    id: number;
    name: string;
    designation: string;
    image: string;
  }[];
  className?: string;
  selectedId?: number | null;
  onSelect?: (id: number) => void;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  // New state to disable tooltip temporarily after selection
  const [disableTooltip, setDisableTooltip] = useState(false);
  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0);
  const rotate = useSpring(useTransform(x, [-100, 100], [-1, 1]), springConfig);
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-1, 1]),
    springConfig
  );
  const handleMouseMove = (event: any) => {
    const halfWidth = event.target.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth);
  };

  // Calculate the order and positions
  const orderedItems = React.useMemo(() => {
    if (!selectedId) return items;

    const middleIndex = Math.floor(items.length / 2);
    const selectedIndex = items.findIndex((item) => item.id === selectedId);

    if (selectedIndex === middleIndex) return items;

    const newOrder = [...items];
    const [selectedItem] = newOrder.splice(selectedIndex, 1);
    const [middleItem] = newOrder.splice(
      middleIndex - (selectedIndex < middleIndex ? 1 : 0),
      1
    );

    newOrder.splice(selectedIndex, 0, middleItem);
    newOrder.splice(middleIndex, 0, selectedItem);

    return newOrder;
  }, [items, selectedId]);

  // Updated showTooltipFor: disable tooltips if disableTooltip is true
  const showTooltipFor = (itemId: number) => {
    if (disableTooltip) return false;
    return (
      hoveredIndex === itemId ||
      (selectedId === itemId && hoveredIndex === null)
    );
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 relative",
        className
      )}
    >
      {orderedItems.map((item, index) => (
        <motion.div
          key={item.id}
          layout
          initial={false}
          animate={{ opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
          className="-mr-4 relative group cursor-pointer"
          onMouseEnter={() => {
            if (!disableTooltip) setHoveredIndex(item.id);
          }} // Updated here
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => {
            if (selectedId === item.id) {
              onSelect?.(0); // Deselect if clicking same avatar
            } else {
              onSelect?.(item.id);
            }
            setDisableTooltip(true);
            setTimeout(() => setDisableTooltip(false), 300); // disable for 300ms instead of 1000ms
          }}
        >
          <AnimatePresence mode="popLayout">
            {showTooltipFor(item.id) && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: "nowrap",
                }}
                className={cn(
                  "absolute -top-16 flex text-xs flex-col items-center justify-center rounded-md bg-blue-500 z-50 px-4 py-2 bg-opacity-0 pointer-events-none",
                  "right-[10%] left-[10%]"
                )}
              >
                <div className="font-bold text-black relative z-30 text-base">
                  {item.name}
                </div>
                <div className="text-black/80 text-xs">{item.designation}</div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="relative">
            <Image
              onMouseMove={handleMouseMove}
              height={100}
              width={100}
              src={item.image}
              alt={item.name}
              className={cn(
                "object-cover !m-0 !p-0 object-top rounded-full h-14 w-14 border-2 group-hover:scale-105 group-hover:z-30 border-background relative transition duration-500",
                selectedId === item.id &&
                  "ring-4 ring-offset-2 ring-blue-600 scale-110 z-30"
              )}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
