'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Brain, Medal, ArrowRight, Package,
         Compass, PieChart, Box, Calculator, Ruler, Clock,
         Gauge, LineChart, Wallet, Award, Crown, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
// Interface definitions
interface MultipleChoiceProps {
  options: string[];
  onSelect: (index: number) => void;
  correctAnswer: number;
  showFeedback: boolean;
}

interface MatchingChallengeProps {
  items: Array<{
    left: string;
    right: string;
    correctIndex: number;
  }>;
  onSubmit: (isCorrect: boolean) => void;
}

interface DragToOrderProps {
  items: Array<{
    id: string;
    content: string;
    correctPosition: number;
  }>;
  onOrderComplete: (isCorrect: boolean) => void;
}

interface NumericInputProps {
  onSubmit: (isCorrect: boolean) => void;
  correctAnswer: number;
  tolerance: number;
}

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}

// Challenge Type Components
// Challenge Type Components
const MultipleChoice: React.FC<MultipleChoiceProps> = ({ options, onSelect, correctAnswer, showFeedback }) => {
  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <Button
          key={index}
          variant="outline"
          className={`w-full text-left p-4 ${
            showFeedback 
              ? index === correctAnswer 
                ? 'bg-green-100 border-green-500'
                : 'bg-red-100 border-red-500'
              : 'hover:bg-gray-50'
          }`}
          onClick={() => onSelect(index)}
        >
          {option}
        </Button>
      ))}
    </div>
  );
};

interface MatchingItem {
  left: string;
  right: string;
  correctIndex: number;
}

interface MatchingChallengeProps {
  items: MatchingItem[];
  onSubmit: (isCorrect: boolean) => void;
}

const MatchingChallenge: React.FC<MatchingChallengeProps> = ({ items, onSubmit }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [matches, setMatches] = useState<Array<{ questionIndex: number; answerIndex: number }>>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [shuffledAnswers, setShuffledAnswers] = useState<Array<{ text: string; correctIndex: number }>>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    // Create array of answers with their correct indices
    const answers = items.map((item, index) => ({
      text: item.right,
      correctIndex: item.correctIndex
    }));
    
    // Shuffle answers
    const shuffled = [...answers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledAnswers(shuffled);
  }, [items]);

  const handleQuestionClick = (index: number) => {
    if (!isComplete) {
      setSelectedQuestion(selectedQuestion === index ? null : index);
    }
  };

  const handleAnswerClick = (answerIndex: number) => {
    if (selectedQuestion !== null && !isComplete) {
      const newMatches = [...matches, {
        questionIndex: selectedQuestion,
        answerIndex
      }];
      setMatches(newMatches);
      setSelectedQuestion(null);

      if (newMatches.length === items.length) {
        // Check if each match is correct by comparing correctIndex
        const isCorrect = newMatches.every(match => {
          const question = items[match.questionIndex];
          const answer = shuffledAnswers[match.answerIndex];
          return question.correctIndex === answer.correctIndex;
        });
        setIsComplete(true);
        setIsCorrect(isCorrect);
        onSubmit(isCorrect);
      }
    }
  };

  const isMatched = (type: 'question' | 'answer', index: number): boolean => {
    return matches.some(match =>
      (type === 'question' && match.questionIndex === index) ||
      (type === 'answer' && match.answerIndex === index)
    );
  };

  const getMatchColor = (type: 'question' | 'answer', index: number): string => {
    const match = type === 'question'
      ? matches.find(m => m.questionIndex === index)
      : matches.find(m => m.answerIndex === index);
    
    if (match) {
      const question = items[match.questionIndex];
      const answer = shuffledAnswers[match.answerIndex];
      const isCorrectMatch = question.correctIndex === answer.correctIndex;
      return isCorrectMatch ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500';
    }
    return '';
  };
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="font-medium text-gray-700 mb-2">Questions:</div>
          {items.map((item, index) => (
            <Button
              key={`question-${index}`}
              variant="outline"
              className={`w-full justify-start p-4 text-gray-900 border-2 ${
                selectedQuestion === index
                  ? 'bg-blue-100 border-blue-500'
                  : isMatched('question', index)
                  ? getMatchColor('question', index)
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              }`}
              onClick={() => handleQuestionClick(index)}
              disabled={isMatched('question', index)}
            >
              {item.left}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          <div className="font-medium text-gray-700 mb-2">Answers:</div>
          {shuffledAnswers.map((answer, index) => (
            <Button
              key={`answer-${index}`}
              variant="outline"
              className={`w-full justify-start p-4 text-gray-900 border-2 ${
                isMatched('answer', index)
                  ? getMatchColor('answer', index)
                  : selectedQuestion !== null
                  ? 'bg-white hover:bg-blue-50 border-blue-200'
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              }`}
              onClick={() => handleAnswerClick(index)}
              disabled={isMatched('answer', index) || selectedQuestion === null}
            >
              {answer.text}
            </Button>
          ))}
        </div>
      </div>

      {selectedQuestion !== null && (
        <div className="text-center text-blue-600 bg-blue-50 p-2 rounded-lg">
          Now click the matching answer
        </div>
      )}

      {isComplete && (
        <div className={`p-4 rounded-lg ${
          isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {isCorrect
            ? 'Perfect match! All items correctly matched!'
            : 'Some matches are incorrect. Check the colored borders and try again!'}
        </div>
      )}
    </div>
  );
};

interface DragToOrderItem {
  id: string;
  content: string;
  correctPosition: number;
}

import type { DropResult } from '@hello-pangea/dnd';

interface DragToOrderProps {
  items: DragToOrderItem[];
  onOrderComplete: (isCorrect: boolean) => void;
}

const DragToOrder: React.FC<DragToOrderProps> = ({ items, onOrderComplete }) => {
  const [orderedItems, setOrderedItems] = useState<DragToOrderItem[]>(items);
  
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const reorderedItems = Array.from(orderedItems);
    const [reorderedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, reorderedItem);
    
    setOrderedItems(reorderedItems);
    const isCorrect = reorderedItems.every((item, index) => item.correctPosition === index);
    onOrderComplete(isCorrect);
  };

  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="items">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {orderedItems.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="p-4 bg-white border rounded-lg shadow-sm"
                    >
                      {item.content}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <Button
        onClick={() => onOrderComplete(orderedItems.every((item, index) => item.correctPosition === index))}
        className="w-full"
      >
        Submit
      </Button>
    </div>
  );
};

interface NumericInputProps {
  onSubmit: (isCorrect: boolean) => void;
  correctAnswer: number;
  tolerance: number;
}

const NumericInput: React.FC<NumericInputProps> = ({ onSubmit, correctAnswer, tolerance }) => {
  const [value, setValue] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  const handleSubmit = () => {
    const numValue = parseFloat(value);
    const isCorrect = Math.abs(numValue - correctAnswer) <= tolerance;
    setShowFeedback(true);
    onSubmit(isCorrect);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 p-2 border rounded"
          step="any"
        />
        <Button onClick={handleSubmit}>Submit</Button>
      </div>
      {showFeedback && (
        <div className={`p-2 rounded ${Math.abs(parseFloat(value) - correctAnswer) <= tolerance 
          ? 'bg-green-100 text-green-700' 
          : 'bg-red-100 text-red-700'}`}>
          {Math.abs(parseFloat(value) - correctAnswer) <= tolerance 
            ? 'Correct!' 
            : `Incorrect. The answer should be ${correctAnswer}`}
        </div>
      )}
    </div>
  );
};

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}


interface SliderChallengeComponentProps {
  sliderProps: {
    min: number;
    max: number;
    step: number;
    correctAnswer: number;
    tolerance: number;
  };
  onSubmit: (isCorrect: boolean) => void;
}

const SliderChallengeComponent: React.FC<SliderChallengeComponentProps> = ({ sliderProps, onSubmit }) => {
  const [sliderValue, setSliderValue] = useState<number>(0);

  const handleSubmit = () => {
    const isCorrect = Math.abs(sliderValue - sliderProps.correctAnswer) <= sliderProps.tolerance;
    onSubmit(isCorrect);
  };

  return (
    <div className="space-y-4">
      <Slider
        value={sliderValue}
        onChange={setSliderValue}
        min={sliderProps.min}
        max={sliderProps.max}
        step={sliderProps.step}
      />
      <Button onClick={handleSubmit} className="w-full">
        Submit
      </Button>
    </div>
  );
};

const Slider: React.FC<SliderProps> = ({ value, onChange, min, max, step }) => {
  const [currentValue, setCurrentValue] = useState<number>(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setCurrentValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="text-center text-sm text-gray-600">Value: {currentValue}</div>
    </div>
  );
};

// Topics Array containing all 30 challenges
const topics: Topic[] = [
  // Day 1 - Unit Prices
  {
    id: 1,
    name: "Unit Price Comparison",
    description: "Compare prices to find best value",
    difficulty: "Easy",
    badge: "Value Detective",
    badgeIcon: <Brain className="text-purple-500" />,
    challenge: {
      type: "matching",
      question: "Match each product with its unit price:",
      items: [
        {
          left: "500g for £2.50",
          right: "£5.00 per kg",
          correctIndex: 0
        },
        {
          left: "750g for £3.60",
          right: "£4.80 per kg",
          correctIndex: 1
        },
        {
          left: "1kg for £4.95",
          right: "£4.95 per kg",
          correctIndex: 2
        }
      ],
      solution: {
        steps: [
          "1. For 500g: £2.50 ÷ 0.5 = £5.00 per kg",
          "2. For 750g: £3.60 ÷ 0.75 = £4.80 per kg",
          "3. For 1kg: Already in price per kg"
        ],
        explanation: "Convert all prices to the same unit (per kg) to compare fairly"
      }
    }
  },

  // Day 2 - Percentages
  {
    id: 2,
    name: "Percentage Changes",
    description: "Calculate sequential percentage changes",
    difficulty: "Medium",
    badge: "Percentage Pro",
    badgeIcon: <Trophy className="text-yellow-500" />,
    challenge: {
      type: "numeric",
      question: "10,000 tickets increase by 12.5% twice, then decrease by 1.7%. How many remain?",
      correctAnswer: 12560,
      tolerance: 1,
      solution: {
        steps: [
          "1. First increase: 10,000 × 1.125 = 11,250",
          "2. Second increase: 11,250 × 1.125 = 12,656.25",
          "3. Decrease: 12,656.25 × 0.983 = 12,560"
        ],
        explanation: "Apply percentage changes one after another"
      }
    }
  },

  // Day 3 - Gradients
  {
    id: 3,
    name: "Accessibility Gradients",
    description: "Calculate ramp gradients for accessibility",
    difficulty: "Medium",
    badge: "Gradient Guru",
    badgeIcon: <Brain className="text-green-500" />,
    challenge: {
      type: "slider",
      question: "A ramp rises 1.2m over 8m length. What is the gradient?",
      sliderProps: {
        min: 0,
        max: 1,
        step: 0.01,
        correctAnswer: 0.15,
        tolerance: 0.01
      },
      solution: {
        steps: [
          "1. Gradient = rise ÷ run",
          "2. 1.2 ÷ 8 = 0.15",
          "3. Can be written as 1:6.67"
        ],
        explanation: "Gradient shows how steep something is by comparing vertical rise to horizontal distance"
      }
    }
  },

  // Day 4 - Tax
  {
    id: 4,
    name: "Tax Calculations",
    description: "Calculate National Insurance contributions",
    difficulty: "Hard",
    badge: "Tax Expert",
    badgeIcon: <Calculator className="text-blue-500" />,
    challenge: {
      type: "numeric",
      question: "Monthly salary £1,560. NI rates: 0% up to £1,048, 10% £1,048-£4,189. Calculate NI payment.",
      correctAnswer: 51.20,
      tolerance: 0.01,
      solution: {
        steps: [
          "1. Amount in 10% band: £1,560 - £1,048 = £512",
          "2. Calculate 10%: £512 × 0.10 = £51.20"
        ],
        explanation: "Calculate amount in each band then apply appropriate percentage"
      }
    }
  },

  // Day 5 - Time Zones
  {
    id: 5,
    name: "Time Zones",
    description: "Calculate journey times across time zones",
    difficulty: "Medium",
    badge: "Time Master",
    badgeIcon: <Clock className="text-indigo-500" />,
    challenge: {
      type: "numeric",
      question: "Flight: Edinburgh 0625 → London 0740 (1h15m flight) → Giza 1855 (Giza +1hr from London). Total flight time?",
      correctAnswer: 435,
      tolerance: 1,
      solution: {
        steps: [
          "1. Edinburgh to London: 75 minutes",
          "2. London to Giza: 6 hours - 1 hour time difference = 360 minutes",
          "3. Total: 75 + 360 = 435 minutes"
        ],
        explanation: "Add actual flight times, accounting for time zone differences"
      }
    }
  },

  // Day 6 - Circle Measurements
  {
    id: 6,
    name: "Circle Calculations",
    description: "Calculate areas and circumferences",
    difficulty: "Medium",
    badge: "Circle Sage",
    badgeIcon: <Brain className="text-purple-500" />,
    challenge: {
      type: "numeric",
      question: "A circular pond has radius 2.5m. A path runs around its edge. If the path is 1m wide, what is the area of the path in square meters?",
      correctAnswer: 20.42,
      tolerance: 0.1,
      solution: {
        steps: [
          "1. Outer circle area: π × (3.5m)² = 38.48m²",
          "2. Inner circle area: π × (2.5m)² = 19.63m²",
          "3. Path area: 38.48m² - 19.63m² = 20.42m²"
        ],
        explanation: "Subtract the area of the inner circle from the area of the outer circle"
      }
    }
  },

  // Day 7 - Volume
  {
    id: 7,
    name: "Container Volume",
    description: "Calculate volumes of 3D shapes",
    difficulty: "Hard",
    badge: "Volume Victor",
    badgeIcon: <Box className="text-green-500" />,
    challenge: {
      type: "numeric",
      question: "A cylindrical container with radius 8cm and height 15cm is filled with water. If you pour this water into a rectangular tank of length 20cm and width 12cm, what will be the height of the water in cm?",
      correctAnswer: 25.13,
      tolerance: 0.1,
      solution: {
        steps: [
          "1. Cylinder volume: π × 8² × 15 = 3016.8cm³",
          "2. Tank area: 20 × 12 = 240cm²",
          "3. Height = Volume ÷ Area = 3016.8 ÷ 240 = 25.13cm"
        ],
        explanation: "Volume is conserved when water is transferred between containers"
      }
    }
  },

  // Day 8 - Statistics
  {
    id: 8,
    name: "Statistical Analysis",
    description: "Calculate mean and standard deviation",
    difficulty: "Hard",
    badge: "Stats Star",
    badgeIcon: <Brain className="text-blue-500" />,
    challenge: {
      type: "numeric",
      question: "Calculate the standard deviation of: 10, 5, 7, 2, 3, 6",
      correctAnswer: 2.88,
      tolerance: 0.01,
      solution: {
        steps: [
          "1. Calculate mean: (10+5+7+2+3+6) ÷ 6 = 5.5",
          "2. Calculate squared differences from mean",
          "3. Take square root of mean of squared differences"
        ],
        explanation: "Standard deviation measures how spread out the numbers are from their average"
      }
    }
  },

  // Day 9 - Bearings
  {
    id: 9,
    name: "Navigation",
    description: "Calculate distances and bearings",
    difficulty: "Hard",
    badge: "Navigation Pro",
    badgeIcon: <Compass className="text-indigo-500" />,
    challenge: {
      type: "multipleChoice",
      question: "A drone flies 400m on bearing 055°, then 500m on bearing 190°. What's the bearing to return to the start?",
      options: [
        "235°",
        "055°",
        "135°",
        "315°"
      ],
      correctAnswer: 0,
      solution: {
        steps: [
          "1. Plot the outward journey",
          "2. Return bearing is opposite to final vector",
          "3. Measure angle from north: 235°"
        ],
        explanation: "The return bearing is measured clockwise from north to the return path"
      }
    }
  },

  // Day 10 - Foreign Exchange
  {
    id: 10,
    name: "Currency Exchange",
    description: "Convert between currencies",
    difficulty: "Medium",
    badge: "Exchange Expert",
    badgeIcon: <Wallet className="text-green-500" />,
    challenge: {
      type: "numeric",
      question: "Using £1 = 59.97 EGP, how many Egyptian Pounds would you get for £1000?",
      correctAnswer: 59970,
      tolerance: 10,
      solution: {
        steps: [
          "1. Multiply amount by exchange rate",
          "2. £1000 × 59.97 = 59,970 EGP"
        ],
        explanation: "Use multiplication to convert between currencies"
      }
    }
  },

  // Day 11 - Container Packing
  {
    id: 11,
    name: "Container Packing",
    description: "Calculate optimal packing arrangements",
    difficulty: "Hard",
    badge: "Packing Pro",
    badgeIcon: <Package className="text-orange-500" />,
    challenge: {
      type: "multipleChoice",
      question: "A box measures 60cm × 45cm × 40cm. Small boxes are 20cm × 15cm × 10cm. What's the maximum number of small boxes that will fit?",
      options: [
        "36",
        "24",
        "48",
        "32"
      ],
      correctAnswer: 0,
      solution: {
        steps: [
          "1. Length: 60 ÷ 20 = 3 boxes",
          "2. Width: 45 ÷ 15 = 3 boxes",
          "3. Height: 40 ÷ 10 = 4 boxes",
          "4. Total: 3 × 3 × 4 = 36 boxes"
        ],
        explanation: "Calculate how many boxes fit in each dimension, then multiply"
      }
    }
  },

  // Day 12 - Best Buys
  {
    id: 12,
    name: "Shopping Smart",
    description: "Compare prices to find best value",
    difficulty: "Medium",
    badge: "Value Expert",
    badgeIcon: <Calculator className="text-green-500" />,
    challenge: {
      type: "matching",
      question: "Match each offer with its unit price:",
      items: [
        {
          left: "3 for £5.40",
          right: "£1.80 each",
          correctIndex: 0
        },
        {
          left: "Buy one get one half price (£3.00)",
          right: "£2.25 each",
          correctIndex: 1
        },
        {
          left: "4 for £10.00",
          right: "£2.50 each",
          correctIndex: 2
        }
      ],
      solution: {
        steps: [
          "1. 3 for £5.40: £5.40 ÷ 3 = £1.80 each",
          "2. BOGOHP: £3.00 + £1.50 = £4.50 for 2 = £2.25 each",
          "3. 4 for £10.00: £10.00 ÷ 4 = £2.50 each"
        ],
        explanation: "Convert all offers to price per unit to compare fairly"
      }
    }
  },

  // Day 13 - Scatter Graphs
  {
    id: 13,
    name: "Data Correlation",
    description: "Analyze scatter graphs and correlation",
    difficulty: "Medium",
    badge: "Pattern Finder",
    badgeIcon: <LineChart className="text-indigo-500" />,
    challenge: {
      type: "dragToOrder",
      question: "Order these correlation coefficients from strongest to weakest:",
      items: [
        { id: "1", content: "r = 0.92", correctPosition: 0 },
        { id: "2", content: "r = -0.87", correctPosition: 1 },
        { id: "3", content: "r = 0.45", correctPosition: 2 },
        { id: "4", content: "r = 0.12", correctPosition: 3 }
      ],
      solution: {
        steps: [
          "1. Ignore negative signs - they show direction",
          "2. Compare absolute values",
          "3. Order: 0.92, -0.87, 0.45, 0.12"
        ],
        explanation: "Correlation strength is shown by how close the absolute value is to 1"
      }
    }
  },

  // Day 14 - Box Plots
  {
    id: 14,
    name: "Box Plot Analysis",
    description: "Interpret statistical measures",
    difficulty: "Medium",
    badge: "Statistics Star",
    badgeIcon: <Medal className="text-purple-500" />,
    challenge: {
      type: "multipleChoice",
      question: "A box plot shows: Min=31, Q1=43, Median=50, Q3=57, Max=92. What is the interquartile range?",
      options: [
        "14",
        "49",
        "61",
        "7"
      ],
      correctAnswer: 0,
      solution: {
        steps: [
          "1. Identify Q1 (43) and Q3 (57)",
          "2. IQR = Q3 - Q1",
          "3. 57 - 43 = 14"
        ],
        explanation: "The interquartile range is the difference between Q3 and Q1"
      }
    }
  },

  // Day 15 - Probability
  {
    id: 15,
    name: "Probability Games",
    description: "Calculate probabilities in games",
    difficulty: "Hard",
    badge: "Chance Master",
    badgeIcon: <Brain className="text-blue-500" />,
    challenge: {
      type: "numeric",
      question: "From a standard deck, what is the probability (as a decimal to 3dp) of drawing two hearts in a row without replacement?",
      correctAnswer: 0.0625,
      tolerance: 0.001,
      solution: {
        steps: [
          "1. First heart: 13/52 = 1/4",
          "2. Second heart: 12/51",
          "3. Multiply: (13/52) × (12/51) = 0.0625"
        ],
        explanation: "For consecutive events, multiply the individual probabilities"
      }
    }
  }

,

  // Day 16 - Manufacturing Tolerance
  {
    id: 16,
    name: "Tolerance Limits",
    description: "Calculate acceptable measurement ranges",
    difficulty: "Medium",
    badge: "Precision Pro",
    badgeIcon: <Ruler className="text-blue-500" />,
    challenge: {
      type: "multipleChoice",
      question: "A component measures 30cm ±2%. What is the acceptable range?",
      options: [
        "29.4cm to 30.6cm",
        "28cm to 32cm",
        "29cm to 31cm",
        "29.8cm to 30.2cm"
      ],
      correctAnswer: 0,
      solution: {
        steps: [
          "1. Calculate 2% of 30cm: 0.6cm",
          "2. Lower limit: 30 - 0.6 = 29.4cm",
          "3. Upper limit: 30 + 0.6 = 30.6cm"
        ],
        explanation: "Add and subtract the percentage tolerance from the nominal value"
      }
    }
  },

  // Day 17 - Ratio Problems
  {
    id: 17,
    name: "Paint Mixing",
    description: "Apply ratios to real problems",
    difficulty: "Medium",
    badge: "Ratio Master",
    badgeIcon: <Brain className="text-purple-500" />,
    challenge: {
      type: "numeric",
      question: "Paint is mixed in ratio 3:5 (red:white). How many litres of red paint are needed to make 32 litres of mixture?",
      correctAnswer: 12,
      tolerance: 0.1,
      solution: {
        steps: [
          "1. Total parts in ratio: 3 + 5 = 8",
          "2. Value of one part: 32 ÷ 8 = 4",
          "3. Red paint needed: 3 × 4 = 12"
        ],
        explanation: "Find the value of one part, then multiply by parts needed"
      }
    }
  },

  // Day 18 - Inverse Proportion
  {
    id: 18,
    name: "Inverse Relationships",
    description: "Solve inverse proportion problems",
    difficulty: "Hard",
    badge: "Pattern Master",
    badgeIcon: <Brain className="text-green-500" />,
    challenge: {
      type: "matching",
      question: "Match each speed with the time taken for a 180km journey:",
      items: [
        {
          left: "60 km/h",
          right: "3 hours",
          correctIndex: 0
        },
        {
          left: "90 km/h",
          right: "2 hours",
          correctIndex: 1
        },
        {
          left: "120 km/h",
          right: "1.5 hours",
          correctIndex: 2
        }
      ],
      solution: {
        steps: [
          "1. Time = Distance ÷ Speed",
          "2. 180 ÷ 60 = 3 hours",
          "3. When speed doubles, time halves"
        ],
        explanation: "Speed and time are inversely proportional for a fixed distance"
      }
    }
  },

  // Day 19 - Journey Planning
  {
    id: 19,
    name: "Complex Journeys",
    description: "Plan multi-stage journeys",
    difficulty: "Hard",
    badge: "Journey Planner",
    badgeIcon: <Clock className="text-orange-500" />,
    challenge: {
      type: "numeric",
      question: "A train leaves at 14:30, journey takes 7h15m, destination is GMT+4. Local arrival time? (Enter as 24hr time, e.g. 13:45 = 13.75)",
      correctAnswer: 1.45,
      tolerance: 0.01,
      solution: {
        steps: [
          "1. Add journey time: 14:30 + 7:15 = 21:45",
          "2. Add time zone: +4 hours",
          "3. Final time: 01:45 next day"
        ],
        explanation: "Add journey duration then adjust for time zone difference"
      }
    }
  },

  // Day 20 - Scale Reading
  {
    id: 20,
    name: "Measurement Scales",
    description: "Read and interpret scales",
    difficulty: "Medium",
    badge: "Scale Reader",
    badgeIcon: <Gauge className="text-indigo-500" />,
    challenge: {
      type: "slider",
      question: "A pressure gauge shows 7.5 divisions where each division is 0.2 bar. What's the pressure in bar?",
      sliderProps: {
        min: 0,
        max: 3,
        step: 0.1,
        correctAnswer: 1.5,
        tolerance: 0.1
      },
      solution: {
        steps: [
          "1. Count divisions: 7.5",
          "2. Value per division: 0.2",
          "3. Calculate: 7.5 × 0.2 = 1.5"
        ],
        explanation: "Multiply number of divisions by value per division"
      }
    }
  },

  // Day 21 - Complex Percentages
  {
    id: 21,
    name: "Price Changes",
    description: "Calculate sequential price changes",
    difficulty: "Hard",
    badge: "Percentage Expert",
    badgeIcon: <Calculator className="text-green-500" />,
    challenge: {
      type: "numeric",
      question: "A price increases by 15%, then decreases by 20%. If final price is £138, what was the original price?",
      correctAnswer: 150,
      tolerance: 0.1,
      solution: {
        steps: [
          "1. Let original price be x",
          "2. After changes: x × 1.15 × 0.8 = 138",
          "3. x × 0.92 = 138, so x = 150"
        ],
        explanation: "Work backwards through the percentage changes"
      }
    }
  },

  // Day 22 - Pie Charts
  {
    id: 22,
    name: "Pie Chart Analysis",
    description: "Convert between angles and percentages",
    difficulty: "Medium",
    badge: "Data Visualizer",
    badgeIcon: <PieChart className="text-purple-500" />,
    challenge: {
      type: "matching",
      question: "Match each percentage to its angle in a pie chart:",
      items: [
        {
          left: "30%",
          right: "108°",
          correctIndex: 0
        },
        {
          left: "45%",
          right: "162°",
          correctIndex: 1
        },
        {
          left: "15%",
          right: "54°",
          correctIndex: 2
        }
      ],
      solution: {
        steps: [
          "1. Full circle = 360°",
          "2. For each %: multiply by 360 and divide by 100",
          "3. Example: 30% = (30 × 360) ÷ 100 = 108°"
        ],
        explanation: "Convert percentages to angles using proportion of 360°"
      }
    }
  },

  // Day 23 - Complex Volume
  {
    id: 23,
    name: "Compound Shapes",
    description: "Calculate volumes of complex shapes",
    difficulty: "Hard",
    badge: "Volume Master",
    badgeIcon: <Box className="text-blue-500" />,
    challenge: {
      type: "numeric",
      question: "A treasure chest is made from a cuboid (90cm × 50cm × 60cm) with a semicylindrical lid (diameter 50cm). Calculate total volume in litres.",
      correctAnswer: 358.36,
      tolerance: 0.1,
      solution: {
        steps: [
          "1. Cuboid: 90 × 50 × 60 = 270,000cm³",
          "2. Semicylinder: (π × 25² × 90) ÷ 2 = 88,357cm³",
          "3. Total: 358,357cm³ = 358.36L"
        ],
        explanation: "Add volumes of each part, convert to litres (1000cm³ = 1L)"
      }
    }
  },

  // Day 24 - Speed Distance Time
  {
    id: 24,
    name: "Journey Calculations",
    description: "Solve complex journey problems",
    difficulty: "Medium",
    badge: "Journey Expert",
    badgeIcon: <Clock className="text-green-500" />,
    challenge: {
      type: "numeric",
      question: "A 300 mile journey: first half at 60mph, second half at 40mph. Total journey time in hours?",
      correctAnswer: 5,
      tolerance: 0.1,
      solution: {
        steps: [
          "1. First 150 miles: 150 ÷ 60 = 2.5 hours",
          "2. Second 150 miles: 150 ÷ 40 = 3.75 hours",
          "3. Total: 2.5 + 3.75 = 5 hours"
        ],
        explanation: "Calculate time for each segment using distance ÷ speed"
      }
    }
  },

  // Day 25 - Advanced Statistics
  {
    id: 25,
    name: "Statistical Comparison",
    description: "Compare datasets using statistics",
    difficulty: "Hard",
    badge: "Stats Expert",
    badgeIcon: <Brain className="text-purple-500" />,
    challenge: {
      type: "multipleChoice",
      question: "Dataset A: mean=10, SD=2. Dataset B: mean=12, SD=4. Which is more consistent?",
      options: [
        "Dataset A",
        "Dataset B",
        "Both equally consistent",
        "Cannot determine"
      ],
      correctAnswer: 0,
      solution: {
        steps: [
          "1. Lower SD means less spread",
          "2. Dataset A: SD = 2",
          "3. Dataset B: SD = 4"
        ],
        explanation: "Lower standard deviation indicates more consistent data"
      }
    }
  },

  // Day 26 - Currency Exchange
  {
    id: 26,
    name: "Complex Exchange",
    description: "Multi-step currency conversions",
    difficulty: "Hard",
    badge: "Exchange Master",
    badgeIcon: <Wallet className="text-blue-500" />,
    challenge: {
      type: "numeric",
      question: "Convert £500 through: £→€ (1.15), €→$ (1.08), $→£ (0.79). How much remains?",
      correctAnswer: 492.39,
      tolerance: 0.01,
      solution: {
        steps: [
          "1. £500 → €575",
          "2. €575 → $621",
          "3. $621 → £492.39"
        ],
        explanation: "Apply each conversion rate in sequence"
      }
    }
  },

  // Day 27 - Box Packing
  {
    id: 27,
    name: "Efficient Packing",
    description: "Optimize container packing",
    difficulty: "Hard",
    badge: "Packing Expert",
    badgeIcon: <Package className="text-orange-500" />,
    challenge: {
      type: "numeric",
      question: "Container: 100cm × 80cm × 60cm. Boxes: 20cm × 15cm × 10cm. How many fit with 5cm spacing?",
      correctAnswer: 60,
      tolerance: 0,
      solution: {
        steps: [
          "1. Available space: 95 × 75 × 55 cm",
          "2. Boxes: 4 × 5 × 3 = 60"
        ],
        explanation: "Account for spacing then calculate boxes per dimension"
      }
    }
  },

  // Day 28 - Time Zones
  {
    id: 28,
    name: "Global Scheduling",
    description: "Plan international meetings",
    difficulty: "Hard",
    badge: "Time Zone Master",
    badgeIcon: <Clock className="text-indigo-500" />,
    challenge: {
      type: "multipleChoice",
      question: "Meeting in London (12:00). What time in New York (-5), Tokyo (+9)?",
      options: [
        "07:00, 21:00",
        "17:00, 03:00",
        "07:00, 09:00",
        "05:00, 19:00"
      ],
      correctAnswer: 0,
      solution: {
        steps: [
          "1. New York: -5 hours = 07:00",
          "2. Tokyo: +9 hours = 21:00"
        ],
        explanation: "Apply time differences to London time"
      }
    }
  },

  // Day 29 - Gradient Applications
  {
    id: 29,
    name: "Practical Gradients",
    description: "Apply gradients to real situations",
    difficulty: "Medium",
    badge: "Gradient Expert",
    badgeIcon: <Ruler className="text-green-500" />,
    challenge: {
      type: "numeric",
      question: "A wheelchair ramp rises 1.5m over 12m. Maximum allowed gradient is 1:12. Is this acceptable? (Enter 1 for yes, 0 for no)",
      correctAnswer: 1,
      tolerance: 0,
      solution: {
        steps: [
          "1. Calculate gradient: 1.5 ÷ 12 = 0.125",
          "2. Convert 1:12 to decimal: 1 ÷ 12 = 0.0833",
          "3. 0.125 ≤ 0.0833? No"
        ],
        explanation: "Compare calculated gradient to maximum allowed"
      }
    }
  },

  // Day 30 - Financial Planning
  {
    id: 30,
    name: "Personal Finance",
    description: "Calculate take-home pay",
    difficulty: "Hard",
    badge: "Finance Master",
    badgeIcon: <Calculator className="text-purple-500" />,
    challenge: {
      type: "numeric",
      question: "Salary £42,000. NI 12% above £1,048/month, Tax 20%, Pension 5%. Monthly take-home?",
      correctAnswer: 2651.83,
      tolerance: 0.01,
      solution: {
        steps: [
          "1. Monthly gross: £3,500",
          "2. NI: (3500-1048) × 0.12 = £294.24",
          "3. Tax: £3,500 × 0.2 = £700",
          "4. Pension: £3,500 × 0.05 = £175",
          "5. Take-home: £2,651.83"
        ],
        explanation: "Apply deductions in correct order to calculate net pay"
      }
    }
  }
];

type ChallengeBase = {
  question: string;
  solution: {
    steps: string[];
    explanation: string;
  };
};

type MatchingChallenge = ChallengeBase & {
  type: 'matching';
  items: Array<{
    left: string;
    right: string;
    correctIndex: number;
  }>;
};

type MultipleChoiceChallenge = ChallengeBase & {
  type: 'multipleChoice';
  options: string[];
  correctAnswer: number;
};

type NumericChallenge = ChallengeBase & {
  type: 'numeric';
  correctAnswer: number;
  tolerance: number;
};

type DragToOrderChallenge = ChallengeBase & {
  type: 'dragToOrder';
  items: Array<{
    id: string;
    content: string;
    correctPosition: number;
  }>;
};

type SliderChallenge = ChallengeBase & {
  type: 'slider';
  sliderProps: {
    min: number;
    max: number;
    step: number;
    correctAnswer: number;
    tolerance: number;
  };
};

type ChallengeType = 'matching' | 'multipleChoice' | 'numeric' | 'dragToOrder' | 'slider';

type Challenge = MatchingChallenge | MultipleChoiceChallenge | NumericChallenge | DragToOrderChallenge | SliderChallenge;

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requiredStreak: number;
  color: string;
}

const achievements: Achievement[] = [
  {
    id: 'beginner',
    name: 'Math Rookie',
    description: 'Get a streak of 3',
    icon: <Award className="text-blue-500" />,
    requiredStreak: 3,
    color: 'blue'
  },
  {
    id: 'intermediate',
    name: 'Math Pro',
    description: 'Get a streak of 5',
    icon: <Target className="text-green-500" />,
    requiredStreak: 5,
    color: 'green'
  },
  {
    id: 'expert',
    name: 'Math Master',
    description: 'Get a streak of 10',
    icon: <Crown className="text-yellow-500" />,
    requiredStreak: 10,
    color: 'yellow'
  }
];

interface Topic {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  badge: string;
  badgeIcon: React.ReactNode;
  challenge: Challenge;
}

// Type guard to check if a challenge is of a specific type
function isChallengeType<T extends Challenge>(
  challenge: Challenge,
  type: ChallengeType
): challenge is T {
  return challenge.type === type;
}

  const MathChallengeApp: React.FC = () => {
    const [componentKey, setComponentKey] = useState<number>(0);
  // Load saved progress from localStorage
  const loadProgress = () => {
    const savedProgress = localStorage.getItem('mathChallengeProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      return {
        currentDay: progress.currentDay || 1,
        score: progress.score || 0,
        currentStreak: progress.currentStreak || 0,
        highestStreak: progress.highestStreak || 0,
        unlockedAchievements: progress.unlockedAchievements || []
      };
    }
    return {
      currentDay: 1,
      score: 0,
      currentStreak: 0,
      highestStreak: 0,
      unlockedAchievements: []
    };
  };

  // Initialize state with saved progress
  const progress = loadProgress();
  const [currentDay, setCurrentDay] = useState<number>(progress.currentDay);
  const [score, setScore] = useState<number>(progress.score);
  const [currentStreak, setCurrentStreak] = useState<number>(progress.currentStreak);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [currentTopic, setCurrentTopic] = useState<Topic>(topics[progress.currentDay - 1]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(progress.unlockedAchievements);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [highestStreak, setHighestStreak] = useState(progress.highestStreak);

  // Save progress whenever it changes
  useEffect(() => {
    const progress = {
      currentDay,
      score,
      currentStreak,
      highestStreak,
      unlockedAchievements
    };
    localStorage.setItem('mathChallengeProgress', JSON.stringify(progress));
  }, [currentDay, score, currentStreak, highestStreak, unlockedAchievements]);

  // Reset progress function
  const resetProgress = () => {
    localStorage.removeItem('mathChallengeProgress');
    setCurrentDay(1);
    setScore(0);
    setCurrentStreak(0);
    setHighestStreak(0);
    setUnlockedAchievements([]);
    setCurrentTopic(topics[0]);
    setShowAnswer(false);
    setIsCorrect(null);
    setShowCompletion(false);
  };

  useEffect(() => {
    const topic = topics[currentDay - 1];
    if (topic) {
      setCurrentTopic(topic);
    }
  }, [currentDay]);

  useEffect(() => {
    // Check for new achievements based on streak
    const newAchievements = achievements.filter(achievement =>
      currentStreak >= achievement.requiredStreak &&
      !unlockedAchievements.includes(achievement.id)
    );

    if (newAchievements.length > 0) {
      // Show the highest level achievement unlocked
      const highestAchievement = newAchievements[newAchievements.length - 1];
      setShowAchievement(highestAchievement);
      setUnlockedAchievements(prev => [...prev, ...newAchievements.map(a => a.id)]);

      // Hide achievement notification after 3 seconds
      setTimeout(() => {
        setShowAchievement(null);
      }, 3000);
    }
  }, [currentStreak, unlockedAchievements]);

  const handleAnswerSubmit = (correct: boolean): void => {
    if (isCorrect === null) {  // Only update if not already set
      setIsCorrect(correct);
      if (correct) {
        setScore((prevScore) => prevScore + 10);
        setCurrentStreak((prevStreak) => {
          const newStreak = prevStreak + 1;
          setHighestStreak((current: number) => Math.max(current, newStreak));
          return newStreak;
        });
      } else {
        setCurrentStreak(0);
      }
    }
  };

  const moveToNextDay = (): void => {
    if (currentDay < topics.length) {
      const isLastDay = currentDay === topics.length - 1;
      
      setCurrentDay((prevDay) => prevDay + 1);
      setShowAnswer(false);
      setIsCorrect(null);
      setComponentKey(key => key + 1);
      
      // Reset the state for the next challenge
      const nextTopic = topics[currentDay];
      if (nextTopic) {
        setCurrentTopic(nextTopic);
      }

      // Show completion modal after the last question
      if (isLastDay) {
        setShowCompletion(true);
      }
    }
  };

  const renderChallenge = (): React.ReactElement => {
    const challenge = currentTopic.challenge;
    
    if (isChallengeType<MatchingChallenge>(challenge, 'matching')) {
      return (
        <MatchingChallenge
          key={componentKey}
          items={challenge.items}
          onSubmit={handleAnswerSubmit}
        />
      );
    }
    
    if (isChallengeType<MultipleChoiceChallenge>(challenge, 'multipleChoice')) {
      return (
        <MultipleChoice
          key={componentKey}
          options={challenge.options}
          correctAnswer={challenge.correctAnswer}
          onSelect={(index) => handleAnswerSubmit(index === challenge.correctAnswer)}
          showFeedback={isCorrect !== null}
        />
      );
    }
    
    if (isChallengeType<NumericChallenge>(challenge, 'numeric')) {
      return (
        <NumericInput
          key={componentKey}
          correctAnswer={challenge.correctAnswer}
          tolerance={challenge.tolerance}
          onSubmit={handleAnswerSubmit}
        />
      );
    }
    
    if (isChallengeType<DragToOrderChallenge>(challenge, 'dragToOrder')) {
      return (
        <DragToOrder
          key={componentKey}
          items={challenge.items}
          onOrderComplete={handleAnswerSubmit}
        />
      );
    }
    
    if (isChallengeType<SliderChallenge>(challenge, 'slider')) {
      return (
        <SliderChallengeComponent
          key={componentKey}
          sliderProps={challenge.sliderProps}
          onSubmit={handleAnswerSubmit}
        />
      );
    }
    
    return <div>Challenge type not supported</div>;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 relative">
      {showCompletion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full space-y-6">
            <h2 className="text-3xl font-bold text-center mb-6">Congratulations! 🎉</h2>
            
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-xl font-semibold">Final Score: {score}/300</p>
                <p className="text-lg">Highest Streak: {highestStreak}</p>
              </div>

              <div className="border-t border-b border-gray-200 py-4">
                <h3 className="text-lg font-semibold mb-3">Achievements Unlocked:</h3>
                <div className="space-y-2">
                  {unlockedAchievements.map(id => {
                    const achievement = achievements.find(a => a.id === id);
                    if (!achievement) return null;
                    return (
                      <div key={id} className="flex items-center space-x-3">
                        {achievement.icon}
                        <div>
                          <p className="font-medium">{achievement.name}</p>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-center space-y-3">
                <p className="text-lg">Well done on completing all 30 challenges!</p>
                <p className="text-gray-600">Good luck in your Nat 5 Applications Of Mathematics final exam.</p>
              </div>
            </div>

            <Button
              className="w-full mt-6"
              onClick={() => setShowCompletion(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
      {showAchievement && (
        <div
          className="fixed top-4 right-4 bg-white border-2 p-4 rounded-lg shadow-lg flex items-center space-x-3 animate-bounce"
          style={{ borderColor: `rgb(var(--${showAchievement.color}-500))` }}
        >
          <div className="p-2 rounded-full" style={{ backgroundColor: `rgb(var(--${showAchievement.color}-100))` }}>
            {showAchievement.icon}
          </div>
          <div>
            <h4 className="font-bold text-lg">{showAchievement.name}</h4>
            <p className="text-gray-600">{showAchievement.description}</p>
          </div>
        </div>
      )}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Day {currentDay} of 30</span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="text-yellow-500 mr-1" />
                <span>Score: {score}</span>
              </div>
              <div className="flex items-center">
                <Trophy className="text-blue-500 mr-1" />
                <span>Streak: {currentStreak}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                    resetProgress();
                  }
                }}
                className="ml-4 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                Reset Progress
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={(currentDay / 30) * 100} className="w-full h-2" />
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            {currentTopic.badgeIcon}
            <div>
              <h3 className="text-xl font-bold">{currentTopic.name}</h3>
              <p className="text-gray-600">{currentTopic.description}</p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold mb-2">Today&apos;s Challenge:</h4>
            <p className="mb-4">{currentTopic.challenge.question}</p>
            {renderChallenge()}
          </div>

          {showAnswer && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">Solution:</h4>
              <div className="space-y-2">
                {currentTopic.challenge.solution.steps.map((step: string, index: number) => (
                  <p key={index} className="flex items-center">
                    <ArrowRight className="w-4 h-4 mr-2 text-blue-500" />
                    {step}
                  </p>
                ))}
              </div>
              <p className="mt-4 text-gray-700">
                <strong>Explanation:</strong> {currentTopic.challenge.solution.explanation}
              </p>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <Button
              className="w-full"
              onClick={() => setShowAnswer(!showAnswer)}
            >
              {showAnswer ? "Hide Solution" : "Show Solution"}
            </Button>
            {isCorrect !== null && (
              <Button
                className={`w-full ${isCorrect ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                onClick={moveToNextDay}
              >
                {isCorrect ? 'Next Challenge (Correct +10pts)' : 'Try Next Challenge'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MathChallengeApp;