"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ColorPsychology {
  emotion: string;
  meaning: string;
  associations: string[];
}

interface CollapsibleDescriptionProps {
  color: {
    name: string;
    hex: string;
    rgb: string;
    psychology: ColorPsychology;
  };
}

const CollapsibleDescription: React.FC<CollapsibleDescriptionProps> = ({
  color,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDescription = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="mt-2">
      <button
        onClick={toggleDescription}
        className="flex items-center gap-1 text-sm text-blue-500 hover:underline focus:outline-none"
      >
        {isOpen ? (
          <>
            Hide Details <ChevronUp className="h-4 w-4" />
          </>
        ) : (
          <>
            Show Details <ChevronDown className="h-4 w-4" />
          </>
        )}
      </button>
      {isOpen && (
        <div className="mt-2 pl-6">
          <p className="text-sm text-muted-foreground">
            <strong>Meaning:</strong> {color.psychology.meaning}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Three Associations:</strong>
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground">
            {color.psychology.associations.map((association, index) => (
              <li key={index}>{association}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CollapsibleDescription;
