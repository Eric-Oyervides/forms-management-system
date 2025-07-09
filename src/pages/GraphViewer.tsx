import { useState, useEffect, createContext } from 'react';
import { GraphNode } from '../components/GraphNode.tsx';
import { PrefillSettings } from '../components/PrefillSettings.tsx';
import type { Coordinate, NodeObject } from '../components/GraphNode.tsx';
import type { Edge, Form } from '../components/MappingMenu.tsx';
import styles from './GraphViewer.module.css';

//constants for API request
const tenant_id = 1;
const action_blueprint_id = "bp_01jk766tckfwx84xjcxazggzyc";
const PORT = 3000;

//type for overall info structure
export type InfoObject = {
    nodes : NodeObject[],
    edges : Edge[],
    forms : Form[],
};

//context to access the info from child components
export const infoContext = createContext<InfoObject>({nodes: [], edges: [], forms: []});


export function GraphViewer() {
  //state that stores the fetched info
  const [info, setInfo] = useState<InfoObject>({nodes: [], edges: [], forms: []});

  //node array for rendering nodes
  const [nodeArray, setNodeArray] = useState<NodeObject[] | null>(null);

  //node selected to open the node's prefill settings
  const [selectedNode, setSelectedNode] = useState<NodeObject | null>(null);

  const [shiftX, setShiftX] = useState(0);

  //fetch the graph info from the API
  useEffect(() => {
    fetch(`http://localhost:${PORT}/api/v1/${tenant_id}/actions/blueprints/${action_blueprint_id}/graph`, {
      method:'GET',
      headers: {
        'Accept' : 'application/json, application/problem+json'
      },
    })
    .then(res => {
      return res.json();
    })
    .then(data => {
      //console.log(data);
      setInfo(data);
    })
  },[])

  useEffect(() => {
    setNodeArray(() => info.nodes);
    setShiftX(() => calculateShiftX());
  }, [info])


  const calculateShiftX = () => {
    let totalNodes : NodeObject[] = info.nodes;
    if (totalNodes.length < 1) return 0;

    let minPos : Coordinate = {... totalNodes[0].position };
    totalNodes.forEach(element => {
        if (element.position.x < minPos.x){
            minPos.x = element.position.x;
        }
    });
    return -minPos.x;
  }
  const closePrefillSettings = () => {
    setSelectedNode(null);
  }

  return (
    <infoContext.Provider value={info}>
        
        {nodeArray && nodeArray.map((node, index) => (
          <div data-testid="node">
            <GraphNode 
              key={index} 
              info={node} 
              shiftX={shiftX} 
              onClick={() => setSelectedNode(node)}
            />
          </div>
        ))}
        
        {selectedNode && (
          <div data-testid="prefillSettings">
            <PrefillSettings 
              nodeObj={selectedNode} 
              onClose={() => closePrefillSettings()} 
            />
          </div>
        )}
      </infoContext.Provider>
  )
}