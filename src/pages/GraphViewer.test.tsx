import React from "react"
import { render, screen, cleanup, waitFor, within } from "@testing-library/react";
import { GraphViewer } from './GraphViewer';
import { PrefillSettings } from '../components/PrefillSettings' 
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";


describe('GraphViewer', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    afterEach(() => {
        cleanup();
        sessionStorage.clear();
        vi.resetAllMocks();
    });
    it("Shows the correct amount of Nodes", async () => {
        (global.fetch as vi.Mock).mockResolvedValueOnce({
            json: async() => ({
                nodes: [
                    {
                        id: '1',
                        position: {x: 120, y: 10},
                        type: 'form',
                        data: {
                            name: 'Form A',
                            id: "node1",
                            component_id: "1",
                            component_type: 'form',
                        },
                    },
                    {
                        id: '2',
                        position: {x: 120, y: 100},
                        type: 'form',
                        data: {
                            name: 'Form B',
                            id: "node2",
                            component_id: "2",
                            component_type: 'form',
                        },
                    },
                ],
                edges: [],
                forms: [],
            }),
        });
        render(<GraphViewer />)

        await waitFor(() => {
            const nodes = screen.queryAllByTestId("node");
            expect(nodes).toHaveLength(2);
        });
       
    });
    it("Shows the Prefill Settings Menu after selecting a button", async () => {
        (global.fetch as vi.Mock).mockResolvedValueOnce({
            json: async() => ({
                nodes: [
                    {
                        id: '1',
                        position: {x: 120, y: 10},
                        type: 'form',
                        data: {
                            name: 'Form A',
                            id: "node1",
                            component_id: "f_01",
                            component_type: 'form',
                        },
                    },
                ],
                edges: [],
                forms: [
                    {
                        id: "f_01",
                        field_schema: {
                            type: "object",
                            properties: {
                                "multi_select": {},
                                "email": {},
                            },
                        }
                        
                    }
                ],
            }),
        });
        render(<GraphViewer />)

        const nodes = await screen.findAllByTestId("node");
        const button = within(nodes[0]).getByRole('button');
        await userEvent.click(button);

        const prefillSettings = await screen.queryByTestId("prefillSettingsTitle");
        
        expect(prefillSettings).toBeInTheDocument();
       
    });
});