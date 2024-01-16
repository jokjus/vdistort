paper = paper && Object.prototype.hasOwnProperty.call(paper, 'default') ? paper['default'] : paper;
let F = (a) => Math.floor(a) 
let R = (a) => Math.random() * a

let vdist = {

    // Shift slices of image to opposite directions -----------------------------------------
    shift: (item, slizeSize, amount, vertical = false, ungroup = false) => {
		let ib = item.bounds

		let max = vertical ? ib.height : ib.width

		let num = F(max / slizeSize)

		let step = max / num

		let resGroup = new paper.Group()

		let clips = []

		for (let i=0;i<num;i++) {
						
			let clipGroup = new paper.Group({parent: resGroup, clipped: true})
			clips.push(clipGroup)

			tl = ib.topLeft.clone()
			tl[vertical ? 'x' : 'y'] += step * i

			clipsize = vertical ? [step, ib.height] : [ib.width, step] 

			let mask = new paper.Path.Rectangle({point: tl, size: clipsize, parent: clipGroup })

			let ic = item.clone()
			ic.insertBelow(mask)

			mask.clipMask = true

			dir = i%2 == 0 ? 1 : -1
			clipGroup.position[vertical ? 'y' : 'x'] += amount * dir;

		}

		// clips.forEach(clip => vdist.ungroup(clip))
		if (ungroup) vdist.ungroup(resGroup)

		item.remove()

		return resGroup

	},

	triangulate: (item, count, power, pivotType = 1, ungroup = false, poisson = false) => {
		let ib = item.bounds
		let resGroup = new paper.Group()

		let randomPoints = [ib.topCenter.x, ib.topCenter.y, ib.leftCenter.x, ib.leftCenter.y, ib.bottomCenter.x, ib.bottomCenter.y, ib.rightCenter.x, ib.rightCenter.y]
		let points = []
		points.push([ib.topCenter.x, ib.topCenter.y], [ib.leftCenter.x, ib.leftCenter.y], [ib.bottomCenter.x, ib.bottomCenter.y], [ib.rightCenter.x, ib.rightCenter.y])

		if (!poisson) {
			for (let i=0;i<count;i++) {
				x = R(ib.width) + ib.left
				y = R(ib.height) + ib.top
				randomPoints.push( x, y ) // x coordinate
				points.push([x,y])
			}
		}
		else {
			const pds = new PoissonDiskSampling({
				shape: [ib.width, ib.height],
				minDistance: ib.width / (count * 2),
				maxDistance: ib.width / count,
				tries:10,
				distanceFunction: function (p) {
					return 1 - vdist.getValue(p[0], p[1], ib.width, ib.height); // value between 0 and 1
				}
			});
			
			let poisPoints = pds.fill()

			poisPoints.forEach(p => {p[0] += ib.left; p[1] += ib.top})

			// let C = (x,y,r) => new paper.Path.Circle({center: new paper.Point(x,y), radius: r, fillColor: 'red' })

			// poisPoints.forEach(p => {
			// 	C(p[0], p[1], 2)
			// })

			poisPoints.forEach(po => {
				randomPoints.push(po[0], po[1]);
				points.push(po);
			})
		}
		
		const delaunay = new Delaunator(randomPoints);
		let tri = delaunay.triangles
		let co = delaunay.coords

		forEachTriangle(points, delaunay, drawTri)
		if (ungroup) vdist.ungroup(resGroup);

		item.remove()

		return resGroup

		

		// Helpers

		function drawTri(inp, points) {

			let clipGroup = new paper.Group({parent: resGroup, clipped: true})

			let mask = new paper.Path({
				segments: points,
				strokeColor: 'red',
				strokeWidth: 1,
				closed: true,
				parent: clipGroup
			})

			let ic = item.clone()
			ic.insertBelow(mask)
			ic.pivot = pivotType == 1 ? mask.bounds.center : ic.center

			ic.rotate(Math.random() * power * 180)

			mask.clipMask = true
		}

		function edgesOfTriangle(t) { return [3 * t, 3 * t + 1, 3 * t + 2]; }

		function pointsOfTriangle(delaunay, t) {
			return edgesOfTriangle(t)
				.map(e => delaunay.triangles[e]);
		}

		function forEachTriangle(points, delaunay, callback) {
			for (let t = 0; t < delaunay.triangles.length / 3; t++) {
				callback(t, pointsOfTriangle(delaunay, t).map(p => points[p]));
			}
		}

	},


	flattenClipping: (clipGroup) => {

		// Ungroup everything inside a clipping group
		vdist.ungroup(clipGroup)

		// Find the clipping mask (it should be the first layer but cannot be certain)
		var clipMasks = clipGroup.children.filter(obj => {
			return obj.clipMask === true
		})

		var clipMaskOrig = clipMasks[0]

		// if clipmask element is a shape, let's convert to a path first
		let clipMask = clipMaskOrig.type != undefined ? clipMaskOrig.toPath() : clipMaskOrig

		// Close clipping mask for more predicatable results
		if (!clipMask.closed) clipMask.closePath()
		
		// Get the actual clipped layers
		var innerLayers = clipGroup.children.filter(obj => {
			return obj.clipMask === false
		})

		
		// Loop through clipped layers and get the boolean intersection against clone of the clipping mask
		for (var x = 0; x < innerLayers.length; x++) {
			let innerOrig = innerLayers[x]
			let mask = clipMask.clone()
			let origFill = innerOrig.fillColor
			let origStrokeColor = innerOrig.strokeColor
			let origStrokeWidth = innerOrig.strokeWidth

			// if inner element is a shape, let's convert to a path first
			let inner = innerOrig instanceof paper.Shape ? innerOrig.toPath() : innerOrig	

			if (inner.closed) inner.splitAt(inner.firstSegment.location)

			// Use suitable tracing method for open and close	d paths
			let traceMethod = false
			//if (innerOrig.closed || innerOrig.type != undefined) traceMethod = true

			// The boolean operation
			if (inner == undefined) console.log(inner)
			let newEl = inner.intersect(mask, {trace: traceMethod})

			// If the result is a compound path, restore original appearance after boolean operation
			if (newEl instanceof paper.CompoundPath) {
				newEl.children.forEach(el => {
					el.fillColor = origFill
					el.strokeColor = origStrokeColor
					el.strokeWidth = origStrokeWidth
				})
			}						

			// clean up
			inner.remove()
			innerOrig.remove()
			mask.remove()
		}

		let cc = clipGroup.children
		for (let c=cc.length-1;c>=0;c--) {			
			if (cc[c].length < 0.01) cc[c].remove()
		}
		
		
		//clean up	
		clipMask.remove()
		clipMaskOrig.remove()
		clipGroup.clipped = false

	},

	// Recursively ungroup the SVG
	ungroup: (item, keepCompounds = true) => {
		flag = true

		for (var i = 0; i < item.children.length; i++) {
			var el = item.children[i]
			
			// If item is a group
			if ( el.hasChildren() ) {				
				// don't process clipping compound paths
				// if (el.clipMask && el instanceof paper.CompoundPath ) {
				// 	continue
				// }
				if (el instanceof paper.CompoundPath && el.closed && keepCompounds) {				
					continue
				}
				
				// Have to deal with clipping groups first
				if (el.clipped) {
					vdist.flattenClipping(el)
				}

				// Move children to parent element and remove the group
				el.parent.insertChildren(el.index, el.removeChildren())
				el.remove()
				flag = false
			}

			// Recurse as long as there are groups left
			if (!flag) {
				vdist.ungroup(item)
			}
		}
	},

	getValue: (x, y, width, height) => {
		// Calculate the center of the area
		const centerX = width / 2;
		const centerY = height / 2;
	
		// Calculate the maximum distance from the center
		const maxDistance = Math.sqrt((centerX ** 2) + (centerY ** 2));
	
		// Calculate the distance from the center to the given coordinate
		const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
	
		// Calculate the value based on the distance
		const value = 1 - distance / maxDistance;
	
		// Ensure the value is within the [0, 1] range
		return Math.max(0, Math.min(1, value));
	}


}