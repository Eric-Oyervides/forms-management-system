import { useState, useEffect, useContext } from 'react';
import { infoContext } from '../pages/GraphViewer';
import { prefillContext } from './PrefillSettings';
import type { NodeObject } from './GraphNode';
import type { InfoObject } from '../pages/GraphViewer';
import styles from './MappingMenu.module.css';


type MappingMenuProps = {
    nodeObj : NodeObject,
    property : string,
    onClose : () => void,
}

export type Edge = {
    source : string,
    target : string,
}

export type Form = {
    id : string,
    name : string,
    description : string,
    is_reusable : false,
    field_schema : FieldSchema,
}

type FieldSchema = {
    type : string,
    properties : { [propertyName: string]: Property },
    required : string[]
}

export type Property = {
    avantos_type: string,
    type : string,
}

export function MappingMenu({nodeObj, property , onClose} : MappingMenuProps) {
    const info = useContext(infoContext);
    const addFieldSource = useContext(prefillContext);

    //hierarchy of nodes that the selected node (nodeObj) has access to
    const[nodeFamily, setNodeFamily] = useState<NodeObject[]> ([]);

    //stores the property data for each node
    const[propertyData, setPropertyData] = useState<{[key:string]: {[propertyName:string]: Property}}>({});
    
    //controls which form's properties are shown
    const[showProperty, setShowProperty] = useState<{[key:string]: boolean}>({});

    //information shown on the right
    const[description, setDescription] = useState<string[]>([]);
    const[compatible, setCompatible] = useState(false);

    //selection value and activation for confirm button
    const[selection, setSelection] = useState<{propertyName:string; source:string}>({propertyName:"", source:""});
    const[canConfirm, setCanConfirm] = useState(false);


    useEffect(() => {
        GetNodeFamily();
    },[nodeObj]); //, property

    //set show property to false except the current node
    useEffect(() => {
        nodeFamily.forEach((node) => {
            setShowProperty(() => ({...showProperty, [node.data.name]: false}))

            //toggle the last element (current node)
            if(node.data.name === nodeObj.data.name){
                toggleShow(node);
            }
        });
    },[nodeFamily])

    useEffect(() => {
        updateConfirmButton();
    },[selection]);

    //Get the access of the node using info.edges
    const GetNodeFamily = () => {
        //get the ids
        let edges : Edge[] = info.edges ?? [{source:"", target: ""}];
        let ids = new Set<string>();
        let currentID = "";
        let queue : string[] = [nodeObj.id];
        while (queue.length > 0){
            currentID = queue.shift()!;
            ids.add(currentID);
            for(let i = 0; i < edges.length; i++){
                if (edges[i].target === currentID && !ids.has(edges[i].source)){
                    queue.push(edges[i].source);
                }
            }
        }
        //translate to nodes
        let nodes : NodeObject[] = info.nodes;
        let newFam : NodeObject[] = [];
        ids.forEach((id, index) => {
            for (let i = 0; i < nodes.length; i++){
                if (nodes[i].id === id) {
                    newFam.push(nodes[i]);
                    break;
                }
            }
        })

        setNodeFamily(newFam.reverse());
    }

    //Get all the properties for a specific node
    const GetFormProperties = (id : string) : { [propertyName: string]: Property } => {
        for (let i = 0; i < info.forms.length; i++) {
            if (info.forms[i].id === id) {
                console.log(info.forms[i].field_schema.properties);
                return info.forms[i].field_schema.properties;
            }
        } 
        return {}  
    }

    //toggle showing the properties of a node
    const toggleShow = (node : NodeObject) => {
        const b = !showProperty[node.data.name];
        setShowProperty(() => ({...showProperty, [node.data.name]: b}));

        //only load when opening the first time (to avoid loading all at the same time)
        if (b && !(Object.keys(propertyData).includes(node.data.name))){
            setPropertyData({...propertyData, [node.data.name]: GetFormProperties(node.data.component_id) ?? {}});
            console.log(`loaded properties for ${node.data.name}`);
        }
    };

    //update description to show on the right
    const updateDescription = (nodeName : string, propertyName : string) => {
        const t = propertyData[nodeName][propertyName].type;
        const p = property === "" ? Object.keys(propertyData[nodeObj.data.name])[0] : property;
        const newDesc = [`${nodeName}.${propertyName}:`]
        newDesc.push(`type:${t}`);
        setDescription(() => newDesc);

        setCompatible(t === propertyData[nodeObj.data.name][p].type);
    }

    const updateConfirmButton = () => {
        setCanConfirm(() => compatible);
    }

    const confirmSelection = () => {
        addFieldSource(selection);
        onClose();
    }

    return(
        <div className={styles.mappingMenu__container}>
            <div className={styles.mappingMenu__header}>
                Select data element to map
            </div>
            <div className={styles.mappingMenu__middle}>
                {/*Left side*/}
                <div className={styles.mappingMenu__left}>
                    <div style={{paddingBottom: '18px'}}>Available data</div>

                    {/*Button for every node in family*/}
                    <div className={styles.mappingMenu__containerA}>
                        {nodeFamily.map((node,index)=> (
                            <div 
                                key={index} 
                                style={{
                                    display: 'flex', 
                                    width: '100%', 
                                    flexDirection: 'column',
                                }}
                            >
                                <button 
                                    data-testid={"formButton"}
                                    className={styles.mappingMenu__buttonA} 
                                    onClick={() => toggleShow(node)}
                                >
                                    {node.data.name}
                                </button>

                                {/*property list*/}
                                <div className={styles.mappingMenu__containerB}>
                                    {showProperty[node.data.name] ? 
                                        propertyData[node.data.name] && 
                                        Object.keys(propertyData[node.data.name]).map((propertyName, ind) => (
                                            <button  
                                                data-testid={"mappingFieldButton"}
                                                key={ind} 
                                                className={
                                                    selection.source === node.data.name && 
                                                        selection.propertyName === propertyName ? 
                                                        styles.mappingMenu__selectedPropertyButton : styles.mappingMenu__propertyButton
                                                } 
                                                onClick={() => {setSelection({propertyName:propertyName, source:node.data.name})}} 
                                                onMouseOver={() => updateDescription(node.data.name, propertyName)}
                                                onMouseLeave={() => {
                                                    //if we have a selection, show it's description
                                                    selection.propertyName!=="" ? 
                                                        updateDescription(selection.source, selection.propertyName)
                                                        : setDescription([])
                                                    }
                                                }
                                            >
                                                {propertyName}
                                            </button>
                                        )) 
                                    : null}
                                </div>
                            </div>
                            
                        ))}
                    </div>
                </div>

                {/*Right side*/}
                <div className={styles.mappingMenu__right}>
                    {description.length > 0 ?
                        <>
                            <div style={{fontSize:'18px'}}>
                                {description[0]}
                            </div>
                            <div 
                                style={{
                                    fontSize: '14px', 
                                    color: 'gray', 
                                    padding: "6px", 
                                    marginBottom: '10px'
                                }}
                            >
                                {description[1]}
                            </div>
                            {compatible ? 
                                <div style={{color: 'green'}}>
                                    compatible
                                </div> 
                                : <div style={{color: 'red'}}>
                                    not compatible
                                  </div>
                            }
                        </>
                        : <div style={{color:'gray'}}>
                            Select an element
                          </div>
                    }
                </div>
            </div>


            <div className={styles.mappingMenu__footer}>
                <button 
                    className={styles.mappingMenu__back} 
                    onClick={() => {
                        setSelection({propertyName: "", source: ""}); 
                        onClose()
                    }}
                >
                    Back
                </button>
                <button 
                    data-testid={"confirmButton"}
                    className={styles.mappingMenu__confirm} 
                    disabled={!canConfirm} 
                    onClick={() => confirmSelection()}
                >
                    Select
                </button>
            </div>
        
        </div>
    )
}