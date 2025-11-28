import React from "react";

const Instructions = ({ heading, description, points, separateLine = false }) => {
    return (
        <div className="bg-white">
            <h2 className="text-2xl font-bold text-black mb-4">{heading}</h2>
            {description ? <p className="mb-4">{description}</p> : null}
            <ul className="pl-4 list-decimal list-outside space-y-1">
                {points.map((point, index) => (
                    <li key={index} className={separateLine ? "mb-2" : ""}>
                        <span className="font-semibold">{point.step}</span>
                        {separateLine ? <br /> : " "}
                        <span>{point.desc}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Instructions;
