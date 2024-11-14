// components/TallyScore.tsx
import React from 'react';

type TallyScoreProps = {
    totalScore: number;
    percentage: number;
    metrics: {
        weeklyIncrease: number;
        loadIncrease: number;
        streak: number;
        restWarning: boolean;
    };
};

const TallyScore: React.FC<TallyScoreProps> = ({ totalScore, percentage, metrics }) => {
    const { weeklyIncrease, loadIncrease, streak, restWarning } = metrics;

    return (
        <div className="tally-score p-4 bg-gray-700 text-white rounded-lg mb-4 shadow-md">
            <p className="text-sm">Total Effort Points Earned</p>
            <h2 className="text-2xl font-semibold my-2">{totalScore.toFixed(2)}</h2>
            <p className="text-xs">{percentage}% of goal</p>
            
            {/* Metrics Section */}
            <div className="metrics mt-4 text-xs text-gray-300">
                <p>Weekly Increase: +{weeklyIncrease.toFixed(2)} points</p>
                <p>Load Increase: {loadIncrease}% this week</p>
                <p>Metcon Streak: {streak} {streak > 1 ? 'workouts' : 'workout'} in a row</p>
                {restWarning && <p className="text-red-500">High load detected – consider rest!</p>}
            </div>
        </div>
    );
};

export default TallyScore;
