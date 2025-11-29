import React from "react";
import './instructions.css';

const Instructions = ({ heading, description, points, separateLine = false }) => {
    return (
        <div className="instructions-card">
            <h2 className="instructions-title">{heading}</h2>
            {description ? <p className="instructions-description">{description}</p> : null}
            <ul className="instructions-list">
                {points.map((point, index) => (
                    <li key={index} className={`instruction-item ${separateLine ? "separate-line" : ""}`}>
                        <span className="instruction-step">{point.step}</span>
                        {separateLine ? <br /> : " "}
                        <span className="instruction-desc">{point.desc}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Instructions;
