const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let mode = 'freehand';
let color = '#000';
let isDrawing = false;
let points = [];
let shapes = [];
let selectedShapeIndex = -1;
let copiedShape = null;
let isMoving = false;
const history = [];
let nextState = [];


class Group {
  constructor(shapes = []) {
    this.shapes = shapes;
  }
}

shapes.forEach((shape) => {
  shape.group = new Group([shape]);
});


    function changeMode(newMode) {
      mode = newMode;
      points = [];
      selectedShapeIndex = -1;
      
    }

    function handleMouseDown(event) {
    //   isDrawing = true;
    //   points = [];
    //   points.push({ x: event.clientX - canvas.offsetLeft, y: event.clientY - canvas.offsetTop });
    const mouseX = event.clientX - canvas.offsetLeft;
    const mouseY = event.clientY - canvas.offsetTop;
  
    // Check if the mouse click is inside any shape
    selectedShapeIndex = -1; // Reset selectedShapeIndex
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      //console.log(isInsideShape(mouseX, mouseY, shape));
      if (isInsideShape(mouseX, mouseY, shape) && mode === 'select') {
        selectedShapeIndex = i;
        shape.selected = !shape.selected;
        isMoving = true;
        draw();
        break;
      }
    }
  
    // If no shape was clicked, start drawing a new shape
    if (selectedShapeIndex === -1) {
      isDrawing = true;
      points = [];
      points.push({ x: mouseX, y: mouseY });
      //console.log(points);
    }
    //console.log(isDrawing, isMoving, selectedShapeIndex);
      
    }

    function handleMouseMove(event) {
      //if (!isDrawing) return;
      if (!isDrawing) {
        const mouseX = event.clientX - canvas.offsetLeft;
        const mouseY = event.clientY - canvas.offsetTop;
        if (isMoving && selectedShapeIndex !== -1) {
          // Move the selected shape by updating its points based on mouse movement
          //console.log(points);
          //console.log(isMoving);
          //console.log(shapes[selectedShapeIndex].group);
          if (shapes[selectedShapeIndex].group) {
            // Move the entire group
            const deltaX = mouseX - shapes[selectedShapeIndex].points[0].x;
            const deltaY = mouseY - shapes[selectedShapeIndex].points[0].y;
            shapes[selectedShapeIndex].group.shapes.forEach((shape) => {
              shape.points = shape.points.map((point) => ({
                x: point.x + deltaX,
                y: point.y + deltaY,
              }));
            });
            draw();
          } else {// Move a single shape
          const deltaX = mouseX - shapes[selectedShapeIndex].points[0].x;
          const deltaY = mouseY - shapes[selectedShapeIndex].points[0].y;
          shapes[selectedShapeIndex].points = shapes[selectedShapeIndex].points.map((point) => ({
            x: point.x + deltaX,
            y: point.y + deltaY,
          }));
          draw();
        }
      }
        return;
      }

      points.push({ x: event.clientX - canvas.offsetLeft, y: event.clientY - canvas.offsetTop });
      draw();

    };

    function handleMouseUp() {
      isDrawing = false;
      //draw();
      //selectedShapeIndex = -1;
      isMoving = false;
      if(mode !== 'select'){
        saveShape();
        //saveStateToHistory();
      }
      
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      //console.log(points);
      if(points.length!==0){
        //console.log('shapes:',shapes);
        if (mode === 'freehand') {
          ctx.beginPath();
          //console.log('points:',points);
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.strokeStyle = color;
          ctx.stroke();
        } else if (mode === 'line') {
          if (points.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            ctx.lineTo(points[points.length-1].x, points[points.length-1].y);
            ctx.strokeStyle = color;
            ctx.stroke();
          }
        } else if (mode === 'rectangle') {
          if (points.length >= 2) {
            const width = points[points.length-1].x - points[0].x;
            const height = points[points.length-1].y - points[0].y;
            ctx.strokeStyle = color;
            ctx.strokeRect(points[0].x, points[0].y, width, height);
          }
        } else if (mode === 'ellipse') {
          if (points.length >= 2) {
            const radiusX = Math.abs(points[points.length-1].x - points[0].x) / 2;
            const radiusY = Math.abs(points[points.length-1].y - points[0].y) / 2;
            const centerX = points[0].x + radiusX;
            const centerY = points[0].y + radiusY;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
            ctx.strokeStyle = color;
            ctx.stroke();
          }
        } else if (mode === 'square') {
          if (points.length >= 2) {
            const sideLength = Math.min(Math.abs(points[points.length-1].x - points[0].x), Math.abs(points[points.length-1].y - points[0].y));
            ctx.strokeStyle = color;
            ctx.strokeRect(points[0].x, points[0].y, sideLength, sideLength);
          }
        } else if (mode === 'circle') {
          if (points.length >= 2) {
            const radius = Math.sqrt(Math.pow(points[points.length-1].x - points[0].x, 2) + Math.pow(points[points.length-1].y - points[0].y, 2));
            ctx.beginPath();
            ctx.arc(points[0].x, points[0].y, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = color;
            ctx.stroke();
          }
        } else if (mode === 'polygon') {
          if (points.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
              ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.strokeStyle = color;
            ctx.stroke();
          }
        }
      }
      shapes.forEach((shape, index) => {
        ctx.beginPath();
        ctx.strokeStyle = shape.color;
        if (shape.type === 'freehand') {
          ctx.moveTo(shape.points[0].x, shape.points[0].y);
          shape.points.forEach((point) => {
            ctx.lineTo(point.x, point.y);
          });
        } else if (shape.type === 'line') {
          ctx.moveTo(shape.points[0].x, shape.points[0].y);
          ctx.lineTo(shape.points[shape.points.length-1].x, shape.points[shape.points.length-1].y);
        } else if (shape.type === 'rectangle') {
          ctx.rect(shape.points[0].x, shape.points[0].y, shape.points[shape.points.length-1].x - shape.points[0].x, shape.points[shape.points.length-1].y - shape.points[0].y);
        } else if (shape.type === 'ellipse') {
          const radiusX = Math.abs(shape.points[shape.points.length-1].x - shape.points[0].x) / 2;
          const radiusY = Math.abs(shape.points[shape.points.length-1].y - shape.points[0].y) / 2;
          const centerX = shape.points[0].x + radiusX;
          const centerY = shape.points[0].y + radiusY;
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        } else if (shape.type === 'square') {
            if (shape.points.length >= 2) {
              const sideLength = Math.min(Math.abs(shape.points[shape.points.length-1].x - shape.points[0].x), Math.abs(shape.points[shape.points.length-1].y - shape.points[0].y));
              ctx.strokeStyle = shape.color;
              ctx.strokeRect(shape.points[0].x, shape.points[0].y, sideLength, sideLength);
            }
        } else if (shape.type === 'circle') {
            if (shape.points.length >= 2) {
              shape.radius = Math.sqrt(Math.pow(shape.points[shape.points.length-1].x - shape.points[0].x, 2) + Math.pow(shape.points[shape.points.length-1].y - shape.points[0].y, 2));
              ctx.beginPath();
              ctx.arc(shape.points[0].x, shape.points[0].y, shape.radius, 0, 2 * Math.PI);
              ctx.strokeStyle = shape.color;
              ctx.stroke();
            }
        } else if (shape.type === 'polygon') {
          ctx.moveTo(shape.points[0].x, shape.points[0].y);
          shape.points.forEach((point) => {
            ctx.lineTo(point.x, point.y);
          });
        }
        ctx.stroke();

        if (shape.group) {
          // Draw shapes within the group
          //console.log(shape.group);
          shape.group.shapes.forEach((groupedShape) => {
            // Draw logic for groupedShape
            //console.log('groupedShape:',groupedShape);
            ctx.beginPath();
            ctx.strokeStyle = groupedShape.color;
            if (groupedShape.type === 'freehand') {
              ctx.moveTo(groupedShape.points[0].x, groupedShape.points[0].y);
              groupedShape.points.forEach((point) => {
                ctx.lineTo(point.x, point.y);
              });
            } else if (groupedShape.type === 'line') {
              ctx.moveTo(groupedShape.points[0].x, groupedShape.points[0].y);
              ctx.lineTo(groupedShape.points[groupedShape.points.length-1].x, groupedShape.points[groupedShape.points.length-1].y);
            } else if (groupedShape.type === 'rectangle') {
              ctx.rect(groupedShape.points[0].x, groupedShape.points[0].y, groupedShape.points[groupedShape.points.length-1].x - groupedShape.points[0].x, groupedShape.points[groupedShape.points.length-1].y - groupedShape.points[0].y);
            } else if (groupedShape.type === 'ellipse') {
              const radiusX = Math.abs(groupedShape.points[groupedShape.points.length-1].x - groupedShape.points[0].x) / 2;
              const radiusY = Math.abs(groupedShape.points[groupedShape.points.length-1].y - groupedShape.points[0].y) / 2;
              const centerX = groupedShape.points[0].x + radiusX;
              const centerY = groupedShape.points[0].y + radiusY;
              ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
            } else if (groupedShape.type === 'square') {
                if (groupedShape.points.length >= 2) {
                  const sideLength = Math.min(Math.abs(groupedShape.points[groupedShape.points.length-1].x - groupedShape.points[0].x), Math.abs(groupedShape.points[groupedShape.points.length-1].y - groupedShape.points[0].y));
                  ctx.strokeStyle = groupedShape.color;
                  ctx.strokeRect(groupedShape.points[0].x, groupedShape.points[0].y, sideLength, sideLength);
                }
            } else if (groupedShape.type === 'circle') {
                if (groupedShape.points.length >= 2) {
                  groupedShape.radius = Math.sqrt(Math.pow(groupedShape.points[groupedShape.points.length-1].x - groupedShape.points[0].x, 2) + Math.pow(groupedShape.points[groupedShape.points.length-1].y - groupedShape.points[0].y, 2));
                  ctx.beginPath();
                  ctx.arc(groupedShape.points[0].x, groupedShape.points[0].y, groupedShape.radius, 0, 2 * Math.PI);
                  ctx.strokeStyle = groupedShape.color;
                  ctx.stroke();
                }
            } else if (groupedShape.type === 'polygon') {
              ctx.moveTo(groupedShape.points[0].x, groupedShape.points[0].y);
              groupedShape.points.forEach((point) => {
                ctx.lineTo(point.x, point.y);
              });
            }
              });
        }

        ctx.stroke();

        //console.log(index, selectedShapeIndex);
        if (index === selectedShapeIndex) {
            ctx.strokeStyle = '#00F';
            ctx.lineWidth = 3;
            // ctx.strokeRect(
            //   Math.min(shape.points[0].x, shape.points[shape.points.length-1].x),
            //   Math.min(shape.points[0].y, shape.points[shape.points.length-1].y),
            //   Math.abs(shape.points[shape.points.length-1].x - shape.points[0].x),
            //   Math.abs(shape.points[shape.points.length-1].y - shape.points[0].y)
            // );
            if (shape.type === 'freehand') {
              ctx.moveTo(shape.points[0].x, shape.points[0].y);
              shape.points.forEach((point) => {
                ctx.lineTo(point.x, point.y);
              });
            } else if (shape.type === 'line') {
              ctx.moveTo(shape.points[0].x, shape.points[0].y);
              ctx.lineTo(shape.points[shape.points.length-1].x, shape.points[shape.points.length-1].y);
            } else if (shape.type === 'rectangle') {
              ctx.rect(shape.points[0].x, shape.points[0].y, shape.points[shape.points.length-1].x - shape.points[0].x, shape.points[shape.points.length-1].y - shape.points[0].y);
            } else if (shape.type === 'ellipse') {
              const radiusX = Math.abs(shape.points[shape.points.length-1].x - shape.points[0].x) / 2;
              const radiusY = Math.abs(shape.points[shape.points.length-1].y - shape.points[0].y) / 2;
              const centerX = shape.points[0].x + radiusX;
              const centerY = shape.points[0].y + radiusY;
              ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
            } else if (shape.type === 'square') {
                if (shape.points.length >= 2) {
                  const sideLength = Math.min(Math.abs(shape.points[shape.points.length-1].x - shape.points[0].x), Math.abs(shape.points[shape.points.length-1].y - shape.points[0].y));
                  //ctx.strokeStyle = shape.color;
                  ctx.strokeRect(shape.points[0].x, shape.points[0].y, sideLength, sideLength);
                }
            } else if (shape.type === 'circle') {
                if (shape.points.length >= 2) {
                  shape.radius = Math.sqrt(Math.pow(shape.points[shape.points.length-1].x - shape.points[0].x, 2) + Math.pow(shape.points[shape.points.length-1].y - shape.points[0].y, 2));
                  ctx.beginPath();
                  ctx.arc(shape.points[0].x, shape.points[0].y, shape.radius, 0, 2 * Math.PI);
                  //ctx.strokeStyle = shape.color;
                  ctx.stroke();
                }
            } else if (shape.type === 'polygon') {
              ctx.moveTo(shape.points[0].x, shape.points[0].y);
              shape.points.forEach((point) => {
                ctx.lineTo(point.x, point.y);
              });
            }
            ctx.stroke();
            ctx.lineWidth = 1;
          }
      });
      //saveStateToHistory();

    }

    function saveShape() {
        if (points.length > 0 && mode !== 'select') {
          let shape = { type: mode, points: points.slice(), color, selected: false };
          if (mode === 'circle') {
            //const [x1, y1] = points[0];
            //const [x2, y2] = points[points.length-1];
            let x1 = points[0].x;
            let y1 = points[0].y;
            let x2 = points[points.length-1].x;
            let y2 = points[points.length-1].y;
            const radius = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) / 2;
            const centerX = (x1 + x2) / 2;
            const centerY = (y1 + y2) / 2;
            shape = { type: mode, points: points.slice(), center: { x: centerX, y: centerY }, radius, color, selected: false };
          }
          shapes.push(shape);
          //shapes.push({ type: mode, points: points.slice(), color });
          //console.log(shapes);
        }
        points = [];
        saveStateToHistory();
        //console.log(shapes);
    }

    function isInsideShape(x, y, shape) {
        if (shape.type === 'freehand') {
          // For freehand shape, check if the point is close to any point of the line
          for (const point of shape.points) {
            if (Math.abs(x - point.x) <= 5 && Math.abs(y - point.y) <= 5) {
              return true;
            }
          }
        } else if (shape.type === 'line') {
          // For lines, check if the point is close to the line segment
          //console.log(shape.points);
          //let [x1, y1] = shape.points[0];
          //let [x2, y2] = shape.points[shape.points.length-1];
          let x1 = shape.points[0].x;
          let y1 = shape.points[0].y;
          let x2 = shape.points[shape.points.length-1].x;
          let y2 = shape.points[shape.points.length-1].y;
          let distance = pointToLineDistance(x, y, x1, y1, x2, y2);
          if (distance <= 5) {
            return true;
          }
        } 
        else if (shape.type === 'rectangle') {
          return isInsideRectangle(x, y, shape);
        } else if (shape.type === 'ellipse') {
          return isInsideEllipse(x, y, shape);
        } else if (shape.type === 'square') {
          return isInsideSquare(x, y, shape);
        } else if (shape.type === 'circle') {
          return isInsideCircle(x, y, shape);
        }
        // Add other shape checking logic here (rectangle, ellipse, etc.)
        return false;
    }

    function isInsideRectangle(x, y, shape) {
      //let [x1, y1] = shape.points[0];
      //let [x2, y2] = shape.points[shape.points.length-1];
      let x1 = shape.points[0].x;
      let y1 = shape.points[0].y;
      let x2 = shape.points[shape.points.length-1].x;
      let y2 = shape.points[shape.points.length-1].y;
    
      return x >= Math.min(x1, x2) && x <= Math.max(x1, x2) &&
             y >= Math.min(y1, y2) && y <= Math.max(y1, y2);
    }

    function isInsideEllipse(x, y, shape) {
      //let [cx, cy] = shape.points[0]; // Center of the ellipse
      //let [rx, ry] = shape.points[shape.points.length-1]; // Horizontal and vertical radii
      let cx = shape.points[0].x;
      let cy = shape.points[0].y;
      let rx = shape.points[shape.points.length-1].x;
      let ry = shape.points[shape.points.length-1].y;
    
      const normalizedX = (x - cx) * (x - cx) / (rx * rx);
      const normalizedY = (y - cy) * (y - cy) / (ry * ry);
    
      return normalizedX + normalizedY <= 1;
    }

    function isInsideSquare(x, y, shape) {
      // Convert square to rectangle and then use rectangle's checking logic
      return isInsideRectangle(x, y, {
        ...shape,
        type: 'rectangle',
      });
    }

    function isInsideCircle(x, y, shape) {
      //let [cx, cy] = shape.points[0]; // Center of the circle
      //console.log(shape);
      let cx = shape.center.x;
      let cy = shape.center.y;
      let r = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2)); // Radius
      
    
      return r <= shape.radius;
    }
    
    
    
    

    function pointToLineDistance(x, y, x1, y1, x2, y2) {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;
      
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) {
          // In case of 0 length line
          param = dot / lenSq;
        }
      
        let xx, yy;
      
        if (param < 0) {
          xx = x1;
          yy = y1;
        } else if (param > 1) {
          xx = x2;
          yy = y2;
        } else {
          xx = x1 + param * C;
          yy = y1 + param * D;
        }
      
        const dx = x - xx;
        const dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
      
      

    function selectMode() {
        mode = 'select';
    }
  
    function deleteSelected() {
        //console.log(mode, selectedShapeIndex);
        if (mode !== 'select' || selectedShapeIndex === -1) return;
  
        shapes.splice(selectedShapeIndex, 1);
        selectedShapeIndex = -1;
        draw();
    }
  
    function copySelected() {
        if (mode !== 'select' || selectedShapeIndex === -1) return;
  
        copiedShape = { ...shapes[selectedShapeIndex] };
    }
  
    function pasteSelected() {
        if (!copiedShape) return;
  
        const offsetX = 20;
        const offsetY = 20;
        shapes.push({
          ...copiedShape,
          points: copiedShape.points.map((point) => ({
            x: point.x + offsetX,
            y: point.y + offsetY,
          })),
        });
        selectedShapeIndex = shapes.length - 1;
        draw();
    }
    
    function saveStateToHistory() {
      const stateSnapshot = shapes.map(shape => ({ ...shape })); // Create a deep copy of shapes
      history.push(stateSnapshot);
      //console.log('history:',history);
    }


    function undo() {
      if (history.length > 0) {
        shapes.length = 0; // Clear the shapes array
        //const previousState = history.pop();
        nextState = history.pop();
        if(history.length>0){
        const previousState = history[history.length-1];
        shapes.push(...previousState); // Add shapes from the previous state
        } else {
          shapes = [];
        }
        //console.log('history',history,'shapes',shapes);
        points = [];
        draw();
        //console.log(points);
      }
    }

    function redo() {
      if (history.length >= 0) {
        //const nextState = history.shift();
        //shapes.length = 0; // Clear the shapes array
        shapes.push(...nextState); // Add shapes from the next state
        //console.log(nextState);
        if(history[history.length-1]!==nextState){
          history.push(nextState);
        }
        draw();
        //console.log(history);
      }
    }
    

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    document.getElementById('colorPicker').addEventListener('change', (event) => {
      color = event.target.value;
      //console.log(selectedShapeIndex,shapes);
      shapes[selectedShapeIndex].color = color;
      if(mode === 'select'){
        draw();
      }
    });

const groupButton = document.getElementById('groupButton');

groupButton.addEventListener('click', () => {
  if (mode !== 'select') return;
  //console.log('shapes:',shapes);
  const selectedShapes = shapes.filter((shape) => shape.selected);
  if (selectedShapes.length >= 2) {
    const newGroup = new Group(selectedShapes);
    selectedShapes.forEach((shape) => {
      shape.group = newGroup;
    });
    draw();
  }
});

const ungroupButton = document.getElementById('ungroupButton');

ungroupButton.addEventListener('click', () => {
  if (mode !== 'select') return;

  const selectedShapes = shapes.filter((shape) => shape.selected);
  selectedShapes.forEach((shape) => {
    if (shape.group) {
      shape.group.shapes.forEach((groupedShape) => {
        groupedShape.group = new Group([groupedShape]);
      });
    }
  });
  console.log(shapes);
  draw();
});

const undoButton = document.getElementById('undoButton');
undoButton.addEventListener('click', undo);

const redoButton = document.getElementById('redoButton');
redoButton.addEventListener('click', redo);
