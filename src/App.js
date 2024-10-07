import React, { useState } from 'react';
import { ForceGraph3D } from 'react-force-graph';
import * as THREE from 'three'; // Import THREE.js for 3D geometry
import './App.css';
import guestData from './people_data.json'; // Import the JSON data

const MatchGraph = () => {
  const [name, setName] = useState('');
  const [filteredData, setFilteredData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null); // State for clicked person
  const [highScoreMatches, setHighScoreMatches] = useState([]); // For people with score > 70, excluding score 100
  const [error, setError] = useState(''); // State for error message

  // Helper function to determine color based on matching score
  const getNodeColor = (score) => {
    if (score === 100) return '#ffffff'; // Highest score
    if (score >= 90) return '#6a8aab';
    if (score >= 80) return '#52769c';
    if (score >= 70) return '#41648a';
    if (score >= 60) return '#32557a';
    if (score >= 50) return '#224366';
    if (score >= 40) return '#1e3d5e';
    if (score >= 30) return '#163352';
    return '#071929'; // Lowest score
  };

  // Prepare the graph structure for all people (no filter)
  const preparePeopleData = (inputName) => {
    const normalizedInputName = inputName.toLowerCase(); // Normalize the input name to lowercase

    // Find the user by comparing names in lowercase
    const user = guestData.find(person => person.name.toLowerCase() === normalizedInputName);

    if (!user) {
      setError('Name not found in the guest list. Please use the exact name you registered under.');
      return null;
    }

    // Tier structure
    const tier1 = []; // Highest match (90+)
    const tier2 = []; // 70-90 match
    const tier3 = []; // 50-70 match
    const tier4 = []; // Below 50 match

    // Generate nodes and categorize into tiers
    const nodes = guestData.map(person => {
      const score = user.matching_scores[person.name] || 0;
      const node = {
        id: person.name,
        name: person.name,
        group: person.name === user.name ? 1 : 2, // Group 1 is the user, 2 is everyone else
        description: person.discussion_topics.join("<br />"), // Corrected to join with new lines
        matchingScore: score,
        color: getNodeColor(score), // Set color based on score
      };

      // Categorize by score
      if (score >= 90) {
        tier1.push(node);
      } else if (score >= 70) {
        tier2.push(node);
      } else if (score >= 50) {
        tier3.push(node);
      } else {
        tier4.push(node);
      }

      return node;
    });

    // Create links between tiers
    const links = [];

    // Link nodes from tier 1 to tier 2
    tier1.forEach(node => {
      tier2.forEach(targetNode => {
        links.push({
          source: node.id,
          target: targetNode.id,
          value: targetNode.matchingScore, // Matching score between the nodes
          distance: 1000 - (targetNode.matchingScore * 20), // Adjust distance based on score
        });
      });
    });

    // Link nodes from tier 2 to tier 3
    tier2.forEach(node => {
      tier3.forEach(targetNode => {
        links.push({
          source: node.id,
          target: targetNode.id,
          value: targetNode.matchingScore,
          distance: 500 - (targetNode.matchingScore * 20),
        });
      });
    });

    // Link nodes from tier 3 to tier 4
    tier3.forEach(node => {
      tier4.forEach(targetNode => {
        links.push({
          source: node.id,
          target: targetNode.id,
          value: targetNode.matchingScore,
          distance: 500 - (targetNode.matchingScore * 100),
        });
      });
    });

    // Set the top 5 matches from tier 1, excluding those with a score of 100
    const filteredHighScoreMatches = tier1.filter(node => node.matchingScore < 100).slice(0, 5);
    setHighScoreMatches(filteredHighScoreMatches); 

    return { nodes, links };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Prepare the graph data for all people and generate the graph data
    const graphData = preparePeopleData(name);
    if (graphData) {
      setFilteredData(graphData);
    }
    setLoading(false);
  };

  // Handle node click (and chip click)
  const handleNodeClick = (node) => {
    setSelectedPerson(node); // Set the clicked person to show their info
  };

  // Handle chip click
  const handleChipClick = (person) => {
    setSelectedPerson({
      name: person.name,
      description: person.discussion_topics,
      matchingScore: person.matchingScore,
    }); // Set the selected person from the chip
  };

  // Close popup
  const handleClosePopup = () => {
    setSelectedPerson(null); // Close the popup
  };

  return (
    <div className="app-container">
      {!filteredData ? (
        <form onSubmit={handleSubmit} className="login-form">
          <img src="logo.png" style={{ width: '150px', height: 'auto' }} alt="Logo" />
          <h2>Find Your Matches</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
            className="input-field"
          />
          <button type="submit" className="submit-btn">
            {loading ? 'Loading...' : 'Find Matches'}
          </button>
          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </form>
      ) : (
        <div className="graph-container">
          <h3 style={{ color: 'white' }}>Your Top Matches</h3>
          <div className="chips-container">
            {highScoreMatches.map((person, index) => (
              <span
                key={index}
                className="chip"
                onClick={() => handleChipClick(person)} // Open corresponding person popup on click
              >
                {person.name} {/* Correctly access the person.name */}
              </span>
            ))}
          </div>
          <ForceGraph3D
            graphData={filteredData}
            nodeAutoColorBy="group"
            nodeLabel={(node) => `${node.name}`}
            linkDirectionalParticles={4}
            linkDirectionalParticleSpeed={(d) => d.value * 0.001}
            linkDistance={(link) => link.distance} // Use calculated distance
            onNodeClick={handleNodeClick} // Add click handler
            nodeThreeObject={(node) => {
              // Create a sphere geometry for each node (to make them circular)
              const sphereGeometry = new THREE.SphereGeometry(8, 16, 16); // Radius 8, smoothness 16x16
              const material = new THREE.MeshBasicMaterial({ color: node.color || '#1e3c66' });
              const sphere = new THREE.Mesh(sphereGeometry, material);
              return sphere;
            }}
            width={window.innerWidth} // Full width of the window
            height={window.innerHeight - 100} // Full height minus the header
            cameraPosition={{ x: 0, y: 0, z: 100 }} // Zoomed-in initial position
            />

          {/* Popup for person details */}
          {selectedPerson && (
            <div className="person-popup">
              <button className="close-btn" onClick={handleClosePopup}>x</button>
              <h2>{selectedPerson.name}</h2>
              <p><strong>Talking Points:</strong></p>
              <span className="wrap" dangerouslySetInnerHTML={{ __html: selectedPerson.description ? selectedPerson.description : 'No prompts this time. Chat with them!' }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MatchGraph;