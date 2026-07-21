"use client";

import { FiCheckCircle } from "react-icons/fi";
import Confetti from "./Confetti";

export default function OrderCelebration() {
  return (
    <>
      <Confetti />
      <div className="mx-auto w-20 h-20 rounded-full bg-rose/15 flex items-center justify-center animate-[popIn_0.5s_cubic-bezier(0.34,1.56,0.64,1)]">
        <FiCheckCircle className="text-rose text-5xl" />
      </div>
    </>
  );
}
