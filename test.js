vc = view.center
let Ra = (arr)=>arr[Math.floor(Math.random()*arr.length)];
let R = (a) => Math.random() * a

new Path.Rectangle({
	point: view.bounds.topLeft,
	size: view.bounds.size,
	fillColor: '#222'
})

// area = new Path.Rectangle({
// 	point: vc-new Point(300,300),
// 	size: [600,600],
// 	fillColor: 'white'
// })

cols = ['#afa69e',  '#cac6c3', '#3f3e3a', '#786e66']

// project.importSVG('testimage/v8.svg', function(item) {
// 	imported = item;
//     imported.children[0].remove(); //import creates unwanted rectangle object we need to get rid of
// 	console.log('imported image, starting distortion')
// 	// vdist.shift( vdist.shift(imported, 50, 10, false), 140, 2, true)
// 	// p1 = vdist.shift(imported, 50, 10, false, false )
// 	vdist.shift(imported, 50, 10, true, false )

// 	// phase1 = vdist.triangulate(imported, 100, 0.11, 1, false, false)

// 	// vdist.shift(phase1, 50, 20)
	
// })


for (let y=0;y<2;y++) {
	for (let x=0;x<3;x++) {

		am = y+x == 0 ? 0.01 : (y * 2 + x) / (3*2) /2
		distortCircle([(x*650)+500,(y*600)+350], 40, 6, am)
	}
}


// distortCircle(vc, 50, 10, .1)
// const pds = new PoissonDiskSampling({
// 	shape: [500, 500],
// 	minDistance: 10,
// 	maxDistance: 30,
// 	tries:10,
// 	distanceFunction: function (point) {
//         return point[0] / 200;
//     }
// });

// let C = (x,y,r) => new Path.Circle({center: new Point(x,y), radius: r, fillColor: 'red' })

// let points = pds.fill()
// points.forEach(p => {
// 	C(p[0], p[1], 2)
// })

// console.log(points)


// const points = pds.getPoints().map(([x, y]) => new Point(center.x + x, center.y + y));
// return points;

// console.log(utl.genPoissonPoints(vc, 50, 10, 400))


function distortCircle(cnt, n, size, a) {

	ci = new Group()
	
	
	// for (i=1;i<n;i++) {
	// 	sc = Ra(cols)
	// 	mark = utl.mark(10*i, 20*i, sc, 3)
	// 	mark.parent = ci
	// 	mark.position = cnt

	// }


	for (i=1;i<n;i++) {

		sc = Ra(cols)
		circu = new Path.Circle({
			center: cnt,
			radius: i * size,
			strokeColor: sc,
			// strokeCap: 'round',
			// strokeColor: sc,
			strokeWidth: 4,
			parent: ci
		})

		expanded = PaperOffset.offsetStroke(circu, 2, { cap: 'round' })
		expanded.fillColor = sc
		expanded.parent = ci

		circu.remove()
	}
	
	
	
	ax = Math.random() > 0.5 ? true : false
	// dist1 = vdist.shift(ci, R(100) + 40, R(40) + 5, ax, false)
	vdist.triangulate(ci, 20*a + 3, a, 1, false, true)

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