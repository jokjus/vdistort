paper = paper && Object.prototype.hasOwnProperty.call(paper, 'default') ? paper['default'] : paper;
let F = (a) => Math.floor(a) 

let vdist = {

    // Shift slices of image to opposite directions -----------------------------------------
    shift: (item, slizeSize, amount, vertical = false) => {
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
		vdist.ungroup(resGroup)

		item.remove()

		return resGroup

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
	}


}