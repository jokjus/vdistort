vc = view.center
let Ra = (arr)=>arr[Math.floor(Math.random()*arr.length)];


cols = ['#4583ff',  'Coral']

// project.importSVG('testimage/stat3-flat.svg', function(item) {
// 	imported = item;
//     imported.children[0].remove(); //import creates unwanted rectangle object we need to get rid of
// 	console.log('imported image, starting distortion')
// 	// vdist.shift( vdist.shift(imported, 50, 10, false), 140, 2, true)
// 	// vdist.shift(imported, 20, 100, false)

// 	// phase1 = vdist.triangulate(imported, 20, 0.21)

// 	// vdist.shift(phase1, 50, 20)
	
// })


for (let y=0;y<3;y++) {
	for (let x=0;x<6;x++) {

		am = y+x == 0 ? 0 : (y * 4 + x) / (6*4)
		distortCircle([(x*350)+300,(y*400)+200], 30, 5, am)
	}
}

// distortCircle(vc, 60, 10)


function distortCircle(cnt, n, size, a) {

	ci = new Group()
	
	for (i=0;i<n;i++) {
		sc = i == n/2 ? 'red' : '#333'

		new Path.Circle({
			center: cnt,
			radius: i * size,
			// strokeColor: Ra(cols),
			strokeColor: sc,
			strokeWidth: 4,
			parent: ci
		})
	}
	
	vdist.triangulate(ci, 300*a + 3, a)

	// dist1 = vdist.shift(ci, 50*a+5, 20*a, false)
	
	// dist2 = vdist.shift(dist1, 70*a+5, 60*a, true)

	//vdist.shift(dist2, 90*a, 30*a, false)
}	






// Export SVG ========================================================


document.getElementById('export-button').addEventListener("click", function(e) {	
    var svg = project.exportSVG({asString: true})
    var blob = new Blob([svg], {type: "image/svg+xml;charset=utf-8"})
    saveAs(blob, 'image.svg')
}, false)


// DRAG'N DROP custom images =========================================
function onDocumentDrag(event) {
	document.getElementById('pathTarget').style.display = 'block';
	event.preventDefault();
}

function onDocumentDrop(event) {
	event.preventDefault();

	if (event.target.id == 'pathTarget') {
		var file = event.dataTransfer.files[0];
		var reader = new FileReader();
		circles =  []

		reader.onload = function (event) {
			drawLayer.removeChildren()
			project.layers['drawLayer'].importSVG(event.target.result, function(item) {
				cutterImg = item
				cutterImg.children[0].remove()
				cutterImg.parent.insertChildren(cutterImg.index,  cutterImg.removeChildren());
				cutterImg.remove();
				drawLayer.firstChild.position = view.center
				fillWithCircles(drawLayer.firstChild, 20, 40, 5, 2, 'white', true)
				console.log(circles)
				for (i = 0; i < circles.length; i++) {
					// fillWithCircles(circles[i], 3, circles[i].bounds.width / 3, 2, 'black', false)
					fillWithCircles(circles[i], 5, circles[i].bounds.width / 4, circles[i].bounds.width / 10, 3, 'black', false)
				}
			})
			
		};
		reader.readAsDataURL(file);
		document.getElementById('pathTarget').style.display = 'none';
		
	}
}

document.addEventListener('drop', onDocumentDrop, false);
document.addEventListener('dragover', onDocumentDrag, false);
document.addEventListener('dragleave', onDocumentDrag, false);