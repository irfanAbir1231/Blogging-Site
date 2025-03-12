import { Box, styled } from "@mui/material";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const ParallaxContainer = styled(Box)`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ParallaxContent = styled(motion.div)`
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
  padding: 2rem;
`;

const ParallaxBackground = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  will-change: transform;
`;

const ParallaxSection = ({
  backgroundImage,
  children,
  overlayColor = "rgba(0,0,0,0.5)",
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 1]);

  return (
    <ParallaxContainer ref={ref}>
      <ParallaxBackground
        style={{
          backgroundImage: `linear-gradient(${overlayColor}, ${overlayColor}), url(${backgroundImage})`,
          y,
        }}
      />
      <ParallaxContent style={{ opacity }}>{children}</ParallaxContent>
    </ParallaxContainer>
  );
};

export default ParallaxSection;
