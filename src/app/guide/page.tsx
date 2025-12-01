import Navbar from "@/components/navbar";

export default function AboutPage() {
    return (
        <>
            <Navbar/>
            <main className="p-12 max-w-5xl flex flex-col justify-center gap-y-6">
                <section className="flex flex-col justify-center gap-y-6">
                    <h1 className="md:text-2xl text-xs font-bold">What is this about?</h1>
                    <p className="text-xs">
                        This is a Dijkstra simulation using nforce-graph and ngraph for performing physics engine. In the simulation, you can play around with the node 
                        by dragging them around.
                    </p>
                </section>
                <section className="flex flex-col justify-center gap-y-6">
                    <h1 className="md:text-2xl text-xs font-bold">Graph Setting</h1>
                    <p className="text-xs">
                        In the graph settings, the graph is an undirected graph by default. Enable a directed graph by checking the Directed Graph checkbox.
                        The Target Node checkbox indicates whether the graph has an end node from start to finish. If the target is found, it will show the backtrack path 
                        from the end node to the start node. Speed controls how fast the simulation runs, in milliseconds.
                    </p>
                    <p className="text-xs">
                        In the Random Graph section, you can skip it if you want to create your own graph. You need to enter the number of nodes (N) and the number of edges (E), where N − 1 &le; E &le; N(N − 1) / 2. 
                        After that, click the "Random Graph" button. This will generate a random graph, randomly choose an end node (if enabled), and set the start node to 0.
                    </p>
                </section>
                <section className="flex flex-col justify-center gap-y-6">
                    <h1 className="md:text-2xl text-xs font-bold">Physics Setting</h1>
                    <p className="text-xs">Gravity: More negative values make nodes repel each other more strongly. More positive values make nodes attract each other more strongly.</p>
                    <p className="text-xs">Spring Length: Length of the springs that connect two nodes.</p>
                    <p className="text-xs">Spring Coefficient: Stiffness of the spring.</p>
                    <p className="text-xs">Drag Coefficient: Acts like air resistance; the higher the value, the faster the graph settles after dragging.</p>
                </section>
            </main>
        </>
    )
}