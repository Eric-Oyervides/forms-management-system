import { useEffect, useState, useRef } from 'react';
import styles from './GraphNode.module.css'

export type NodeProps = {
    info: NodeObject;
    shiftX: number;
    onClick?: () => void;
}

export type NodeObject = {
  id: string; //node id
  position: Coordinate;
  data: NodeData;
  type: string; //type (form, branch, trigger, configuration, forEach, action)
}

export type NodeData = {
  id: string; //unique id for action blueprint component
  name: string; 
  component_id: string; //id of the Form
  component_type: string; //component type (form, branch, trigger, configuration, forEach, action)
}

export type Coordinate = {
  x: number;
  y: number;
}

export function GraphNode({info, shiftX, onClick} : NodeProps) {

    const boxRef = useRef<HTMLButtonElement>(null);
    const initialMousePos = useRef<Coordinate | null>(null); 
    const finalMousePos = useRef<Coordinate | null>(null);
    const dragOffset = useRef({x: 0, y: 0});

    
    const [dragging, setDragging] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
    const [position, setPosition] = useState<Coordinate>(() => { //position of the node
        const saved = sessionStorage.getItem(`node-pos-${info.id}`);
        const initialPos = {
            x: info.position.x + shiftX,
            y: info.position.y
        };
        return saved ? JSON.parse(saved) : initialPos;
    });


    //initialize drag behavior
    //sets the intial mouse position and drag offset
    const onMouseDown = (e: React.MouseEvent) => {
        const rect = boxRef.current?.getBoundingClientRect();
        if (rect) {
            initialMousePos.current = {x: e.clientX, y: e.clientY};
            dragOffset.current = {
                x: e.clientX - rect.left, 
                y: e.clientY - rect.top
            };
            setDragging(true);
        }
    };

    //functionality while dragging
    //updates node position
    const onMouseMove = (e: MouseEvent) => {
        if (!dragging) return;

        const newX = e.clientX - dragOffset.current.x;
        const newY = e.clientY - dragOffset.current.y;

        if (newX !== position.x || newY !== position.y) {
            setPosition({x: newX, y: newY});
            setIsMoving(true);
        }
        
    };

    //functionality when releasing
    //resets variables
    const onMouseUp = (e: MouseEvent) => {
        setDragging(false);
        setIsMoving(false);
        finalMousePos.current = {
            x: e.clientX,
            y: e.clientY
        };
    };

    //add/remove mouse event listeners
    useEffect(() => {
        if (dragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        } else {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }
    }, [dragging, dragOffset]);
    
    //update the session storage 
    useEffect(() => {
        sessionStorage.setItem(`node-pos-${info.id}`, JSON.stringify(position));
    }, [position, info.id]);

    return (
        <>
        {/*button definition*/}
        <button 
            className={styles.graphNode__container} 
            ref={boxRef} 
            onMouseDown={onMouseDown} 
            onClick={() => {
                const dx = initialMousePos.current && finalMousePos.current ? Math.abs(finalMousePos.current.x - initialMousePos.current.x) : 0;
                const dy = initialMousePos.current && finalMousePos.current ? Math.abs(finalMousePos.current.y - initialMousePos.current.y) : 0;
                const movedEnough = dx > 1 || dy > 1;
                if (!movedEnough){
                    onClick?.();
                } 
            }}
            style={{
                position: 'absolute',  
                left: `${position.x}px`,
                top: `${position.y}px`,
                cursor: isMoving ? 'grabbing' : 'default'}}
        >
            {/*visuals and labels*/}
            <div className={styles.graphNode__graphic}></div>
            <div className={styles.graphNode__info}>
                <div className={styles.graphNode__type}>
                    <h4 className={styles.graphNode__typeText}>
                        {info.type}
                    </h4>
                </div>
                <div className={styles.graphNode__name}>
                    <h2 className={styles.graphNode__nameText}>{info && info.data.name}</h2>
                </div>
            </div>
        </button>
        </>
    )
}