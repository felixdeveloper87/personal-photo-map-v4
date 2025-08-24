import { Button } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionButton = motion.create(Button);

export const ShowAllButton = ({ isSelected, onClick, children }) => (
  <MotionButton
    colorScheme={isSelected ? "blue" : "gray"}
    onClick={onClick}
    borderRadius="xl"
    size="sm"
    fontWeight="semibold"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.2 }}
  >
    {children || "Show All"}
  </MotionButton>
);

export const YearSelectableButton = ({ year, isSelected, onClick }) => (
  <MotionButton
    colorScheme={isSelected ? "blue" : "gray"}
    onClick={onClick}
    borderRadius="xl"
    size="sm"
    fontWeight="semibold"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.2 }}
  >
    {year}
  </MotionButton>
);


export const AlbumSelectableButton = ({ album, isSelected, onClick }) => (
  <MotionButton
    colorScheme={isSelected ? "blue" : "gray"}
    onClick={onClick}
    borderRadius="xl"
    size="sm"
    fontWeight="semibold"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.2 }}
  >
    {album.name}
  </MotionButton>
);
