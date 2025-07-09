import React from "react"
import { render, screen, cleanup } from "@testing-library/react";
import { GraphNode } from './GraphNode';
import { afterEach, describe, it, expect} from "vitest";
import "@testing-library/jest-dom/vitest";


describe('GraphNode', () => {
    afterEach(() => {
        cleanup();
        sessionStorage.clear();
    });
    it('test reading values correctly', () => {
        const testNodeA = {
            id: '1',
            position: {x: 10, y: 10},
            type: 'form',
            data: {
                name: 'Form A',
                id: "node1",
                component_id: "1",
                component_type: 'form',
            },
        };

        const testNodeB = {
            id: '1',
            position: {x: 10, y: 10},
            type: 'branch',
            data: {
                name: 'Branch B',
                id: "node1",
                component_id: "1",
                component_type: 'form',
            },
        };

        render(
        <>
        <GraphNode info={testNodeA} shiftX={0} onClick ={()=>{}} />
        <GraphNode info={testNodeB} shiftX={0} onClick ={()=>{}} />
        </>
        );

        const formNameA = screen.getByText('Form A');
        const formTypeA = screen.getByText('form');
        const formNameB = screen.getByText('Branch B');
        const formTypeB = screen.getByText('branch');


        expect(formNameA).toBeInTheDocument();
        expect(formTypeA).toBeInTheDocument();
        expect(formNameB).toBeInTheDocument();
        expect(formTypeB).toBeInTheDocument();
    });

    it("test position values reading correctly", () => {
        const testNode = {
            id: '1',
            position: {x: 120, y: 10},
            type: 'form',
            data: {
                name: 'Form A',
                id: "node1",
                component_id: "1",
                component_type: 'form',
            },
        };
        render(<GraphNode info={testNode} shiftX={0} onClick={()=>{}} />);
        const button = screen.getByRole('button');

        expect(button).toHaveStyle({
            left: '120px', 
            top: '10px',
        });
    });
});