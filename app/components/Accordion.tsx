import React, { useState } from 'react';
import { IoIosArrowDown, IoIosArrowForward } from 'react-icons/io';

type AccordionProps = {
  title: string;
  children: React.ReactNode;
};

const Accordion: React.FC<AccordionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`border border-gray-200 rounded-md shadow-sm mb-4 transition-all duration-300 ${isOpen ? 'overflow-y-auto' : 'h-12'}`}>
      <div
        className="p-3 cursor-pointer bg-gray-100 text-gray-800 font-bold flex items-center"
        onClick={toggleAccordion}
      >
        {isOpen ? <IoIosArrowDown className="mr-2" /> : <IoIosArrowForward className="mr-2" />}
        <span>{title}</span>
      </div>
      {isOpen && (
        <div className="p-3 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;
