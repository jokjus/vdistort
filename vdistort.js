paper = paper && Object.prototype.hasOwnProperty.call(paper, 'default') ? paper['default'] : paper;
let F = (a) => Math.floor(a) 

let vdist = {

    // Shift slices of image to opposite directions -----------------------------------------
    shift: (item, slizeSize, amount, vertical = false) => {
		let ib = item.bounds

		let max = vertical ? ib.height : ib.width

		let num = F(max / slizeSize)

		let step = max / num

		for (let i=0;i<num;i++) {
			
			let clipGroup = new Group()
			
			let mask = new Path.Renctangle({point: ib.topLeft + [0, step * i], size: [ib.width, step], parent: clipGroup })

			let ic = item.clone()
			ic.insertBelow(mask)

			mask.clipMask = true

			dir = i%2 == 0 ? 1 : -1
			if (!vertical) clipGroup.position.x += amount * dir
			else clipGroup.position.y += amount * dir

		}

	}
}