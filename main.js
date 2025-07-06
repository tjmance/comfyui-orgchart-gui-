function parseWorkflow(data) {
  const nodes = data.nodes;
  const container = document.getElementById("graph-container");
  container.innerHTML = ""; // clear previous

  const nodePositions = {};
  const levelMap = {};

  function assignLevels(id, level = 0) {
    if (levelMap[id] !== undefined && levelMap[id] <= level) return;
    levelMap[id] = level;
    nodes[id].outputs.forEach(out => assignLevels(out, level + 1));
  }

  const startId = Object.keys(nodes)[0];
  assignLevels(startId);

  const verticalSpacing = 150;
  const horizontalSpacing = 200;
  const nodeWidth = 140;
  const nodesByLevel = {};

  Object.keys(levelMap).forEach(id => {
    const level = levelMap[id];
    if (!nodesByLevel[level]) nodesByLevel[level] = [];
    nodesByLevel[level].push(id);
  });

  Object.keys(nodesByLevel).forEach(level => {
    const ids = nodesByLevel[level];
    ids.forEach((id, i) => {
      const nodeDiv = document.createElement("div");
      nodeDiv.className = "node";
      nodeDiv.innerText = nodes[id].name;
      nodeDiv.style.top = `${level * verticalSpacing}px`;
      nodeDiv.style.left = `${i * horizontalSpacing}px`;
      nodeDiv.id = `node-${id}`;
      container.appendChild(nodeDiv);
      nodePositions[id] = { top: level * verticalSpacing, left: i * horizontalSpacing };
    });
  });

  Object.entries(nodes).forEach(([id, node]) => {
    const start = nodePositions[id];
    node.outputs.forEach(outId => {
      const end = nodePositions[outId];
      const line = document.createElement("div");
      line.className = "line";
      line.style.left = `${start.left + nodeWidth / 2}px`;
      line.style.top = `${start.top + 60}px`;
      line.style.height = `${end.top - start.top - 60}px`;
      container.appendChild(line);
    });
  });
}

document.getElementById("fileInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function (event) {
    const data = JSON.parse(event.target.result);
    parseWorkflow(data);
  };
  reader.readAsText(file);
});

function loadExample() {
  fetch("example-workflow.json")
    .then(res => res.json())
    .then(data => parseWorkflow(data));
}
function loadLiveWorkflow() {
  fetch("http://127.0.0.1:8188/get_prompt")
    .then(res => {
      if (!res.ok) throw new Error("ComfyUI unreachable");
      return res.json();
    })
    .then(data => {
      parseWorkflow(data);
    })
    .catch(err => {
      alert("Failed to load from ComfyUI. Is it running on localhost:8188?");
      console.error(err);
    });
}
