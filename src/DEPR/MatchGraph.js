import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ForceGraph3D } from 'react-force-graph';
import * as THREE from 'three';
import './App.css';
import guestData from '../people_data.json'; // Assuming this is your data

const MatchGraph = () => {
  const [name, setName] = useState('');
  const [searchParams] = useSearchParams();
  const [filteredData, setFilteredData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [highScoreMatches, setHighScoreMatches] = useState([]);
  const [error, setError] = useState('');

  // Get the name from URL query parameter
  useEffect(() => {
    const userName = searchParams.get('name');
    if (userName) {
      console.log(userName)
      setName(userName);
      handleSubmit(); // Automatically load the graph for the user
    } else {
      setError('No name provided. Please log in again.');
    }
  }, [searchParams]);

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

  // Prepare the graph structure for all people
  const preparePeopleData = (inputName) => {
    const normalizedInputName = inputName.toLowerCase();
  
    // Find the user by comparing names in lowercase
    const user = guestData.find(
      (person) => person.name.toLowerCase() === normalizedInputName
    );
  
    // if (!user || !user.matching_scores) {
    //   setError('Matching scores are unavailable for this user.');
    //   return null;
    // }
  
    // Tier structure
    const tier1 = []; // Highest match (90+)
    const tier2 = []; // 70-90 match
    const tier3 = []; // 50-70 match
    const tier4 = []; // Below 50 match
  
    // Generate nodes and categorize into tiers
    const nodes = guestData.map((person) => {
      const score = user.matching_scores[person.name] || 0; // Default to 0 if no matching score
      const node = {
        id: person.name,
        name: person.name,
        group: person.name === user.name ? 1 : 2,
        description: person.discussion_topics?.join('\n') || '',
        matchingScore: score,
        color: getNodeColor(score),
      };
  
      // Categorize by score
      if (score >= 90 && score < 100) {
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
    tier1.forEach((node) => {
      tier2.forEach((targetNode) => {
        links.push({
          source: node.id,
          target: targetNode.id,
          value: targetNode.matchingScore || 0, // Default to 0 if no score
          distance: 500,
        });
      });
    });
  
    // Link nodes from tier 2 to tier 3
    tier2.forEach((node) => {
      tier3.forEach((targetNode) => {
        links.push({
          source: node.id,
          target: targetNode.id,
          value: targetNode.matchingScore || 0, // Default to 0 if no score
          distance: 500,
        });
      });
    });
  
    // Link nodes from tier 3 to tier 4
    tier3.forEach((node) => {
      tier4.forEach((targetNode) => {
        links.push({
          source: node.id,
          target: targetNode.id,
          value: targetNode.matchingScore || 0, // Default to 0 if no score
          distance: 500,
        });
      });
    });
  
    // Set the top 5 matches from tier 1, excluding those with a score of 100
    const filteredHighScoreMatches = tier1.slice(0, 5);
    setHighScoreMatches(filteredHighScoreMatches);
  
    return { nodes, links };
  };
  
  const handleSubmit = () => {
    setLoading(true);
    setError('');

    const graphData = preparePeopleData(name);
    if (graphData) {
      setFilteredData(graphData);
    }
    setLoading(false);
  };

  // Handle node click
  const handleNodeClick = (node) => {
    setSelectedPerson(node);
  };

  // Handle chip click
  const handleChipClick = (person) => {
    setSelectedPerson({
      name: person.name,
      description: person.discussion_topics.join('\n'),
      matchingScore: person.matchingScore,
    });
  };

  // Close popup
  const handleClosePopup = () => {
    setSelectedPerson(null);
  };

  return (
    <div className="app-container">
      {filteredData ? (
        <div className="graph-container">
          <h3 style={{ color: 'white' }}>Your Top Matches</h3>
          <div className="chips-container">
            {highScoreMatches.map((person, index) => (
              <span
                key={index}
                className="chip"
                onClick={() => handleChipClick(person)}
              >
                {person.name}
              </span>
            ))}
          </div>
          <ForceGraph3D
            graphData={filteredData}
            nodeAutoColorBy="group"
            nodeLabel={(node) => node.name}
            linkDirectionalParticles={4}
            linkDirectionalParticleSpeed={(d) => d.value * 0.001}
            linkDistance={(link) => link.distance}
            onNodeClick={handleNodeClick}
            nodeThreeObject={(node) => {
              const sphereGeometry = new THREE.SphereGeometry(8, 16, 16);
              const material = new THREE.MeshBasicMaterial({
                color: node.color || '#1e3c66',
              });
              const sphere = new THREE.Mesh(sphereGeometry, material);
              return sphere;
            }}
            width={window.innerWidth}
            height={window.innerHeight - 100}
            cameraPosition={{ z: 400 }}
            // Adjust physics simulation settings
            d3ForceLayout={(forceGraph) => {
              forceGraph.force('charge').strength(-500);
              forceGraph.force('link').distance((link) => link.distance);
            }}
          />

          {/* Popup for person details */}
          {selectedPerson && (
            <div className="person-popup">
              <button className="close-btn" onClick={handleClosePopup}>
                x
              </button>
              <h2>{selectedPerson.name}</h2>
              <p>
                <strong>Talking Points:</strong>
              </p>
              {selectedPerson.description ? (
                selectedPerson.description.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))
              ) : (
                <p>No prompts this time. Chat with them!</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <p style={{ color: 'red' }}>{error}</p>
      )}
    </div>
  );
};

export default MatchGraph;
