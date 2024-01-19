// Copyright (C) 2024 Sampleprovider(sp)

class ColorInput {
    static #template = document.getElementById('colorInputTemplate');
    static #container = document.getElementById('colorInputMasterContainer');

    // store input fields and current state
    #popup = null;
    #badge = null;
    #stopsContainer = null;
    #controlsParent = null;
    #inputs = {
        modeSelectors: [],
        solid: {
            input: null,
        },
        gradient: {
            pattern: null,
            x: null,
            y: null,
            r: null,
            angle: null,
            stops: []
        }
    }
    #state = {
        mode: 0,
    }
    #oninput = () => { };
    constructor(container) {
        if (!(container instanceof Element)) throw new TypeError('Container element must be a DOM element');
        const cloned = ColorInput.#template.content.cloneNode(true);
        this.#popup = cloned.children[0];
        this.#badge = cloned.children[1];
        container.appendChild(this.#badge);
        ColorInput.#container.appendChild(this.#popup);
        for (let curr = container; curr != null && !curr.classList.contains('tileControls'); curr = curr.parentElement, this.#controlsParent = curr); // I hate this
        // opening/closing
        this.#badge.onclick = (e) => {
            this.#popup.classList.toggle('colorInputContainerHidden');
            if (!this.#popup.classList.contains('colorInputContainerHidden')) {
                const rect = this.#badge.getBoundingClientRect();
                if (rect.top < 242) this.#popup.style.bottom = (window.innerHeight - rect.bottom - 242) + 'px';
                else this.#popup.style.bottom = (window.innerHeight - rect.top - 2) + 'px';
                this.#popup.style.left = Math.min(window.innerWidth - 244, rect.left) + 'px';
                if (this.#controlsParent != null) this.#controlsParent.classList.add('tileControlsNoHide');
            } else {
                if (this.#controlsParent != null) this.#controlsParent.classList.remove('tileControlsNoHide');
            }
        };
        let hideOnClickOff = (e) => {
            if (!document.body.contains(container)) {
                this.#popup.remove();
                document.removeEventListener('mousedown', hideOnClickOff);
            }
            if (!this.#popup.contains(e.target) && e.target != this.#badge && !this.#popup.classList.contains('colorInputContainerHidden')) {
                this.#popup.classList.add('colorInputContainerHidden');
                if (this.#controlsParent != null && (!e.target.matches('.colorInputBadge') || !this.#controlsParent.contains(e.target))) this.#controlsParent.classList.remove('tileControlsNoHide');
            }
        };
        document.addEventListener('mousedown', hideOnClickOff);
        // color type/mode
        this.#inputs.modeSelectors = [this.#popup.querySelector('.colorInputModeSolid'), this.#popup.querySelector('.colorInputModeGradient')];
        const modeContainers = [this.#popup.querySelector('.colorInputSolidContainer'), this.#popup.querySelector('.colorInputGradientContainer')];
        this.#inputs.modeSelectors.forEach((selector, i) => selector.onclick = (e) => {
            modeContainers.forEach(el => el.style.display = 'none');
            this.#inputs.modeSelectors.forEach(el => el.classList.remove('colorInputModeSelected'));
            modeContainers[i].style.display = '';
            selector.classList.add('colorInputModeSelected');
            this.#state.mode = i;
            this.#oninput(e);
            this.#refreshBadge();
        });
        // solid colors
        this.#inputs.solid.input = this.#popup.querySelector('.colorInputSolidColor');
        this.#inputs.solid.input.addEventListener('input', (e) => {
            this.#oninput(e);
            this.#refreshBadge();
        });
        this.#inputs.solid.input.value = '#ffffff';
        // gradient stuff
        this.#inputs.gradient.pattern = this.#popup.querySelector('.colorInputGradientPattern');
        this.#inputs.gradient.pattern.oninput = (e) => {
            switch (Number(this.#inputs.gradient.pattern.value)) {
                case 0:
                    this.#inputs.gradient.x.disabled = true;
                    this.#inputs.gradient.y.disabled = true;
                    this.#inputs.gradient.r.disabled = true;
                    this.#inputs.gradient.angle.disabled = false;
                    break;
                case 1:
                    this.#inputs.gradient.x.disabled = false;
                    this.#inputs.gradient.y.disabled = false;
                    this.#inputs.gradient.r.disabled = false;
                    this.#inputs.gradient.angle.disabled = true;
                    break;
                case 2:
                    this.#inputs.gradient.x.disabled = false;
                    this.#inputs.gradient.y.disabled = false;
                    this.#inputs.gradient.r.disabled = true;
                    this.#inputs.gradient.angle.disabled = false;
                    break;
            }
        };
        this.#inputs.gradient.x = this.#popup.querySelector('.colorInputGradientX');
        this.#inputs.gradient.y = this.#popup.querySelector('.colorInputGradientY');
        this.#inputs.gradient.r = this.#popup.querySelector('.colorInputGradientR');
        this.#inputs.gradient.angle = this.#popup.querySelector('.colorInputGradientAngle');
        for (let i in this.#inputs.gradient) {
            if (this.#inputs.gradient[i] instanceof Element) this.#inputs.gradient[i].addEventListener('input', (e) => {
                this.#oninput();
                this.#refreshBadge();
            });
        }
        this.#inputs.gradient.pattern.oninput();
        this.#stopsContainer = this.#popup.querySelector('.colorInputGradientStops');
        const addStopButton = this.#popup.querySelector('.colorInputGradientAddStop');
        addStopButton.onclick = (e) => this.#addGradientColorStop();
        this.#addGradientColorStop();
        // disable options that don't do anything
        this.#inputs.modeSelectors[0].onclick(); // forced reflow oof
    }
    #addGradientColorStop() {
        // maybe should use a template instead
        const item = document.createElement('div');
        item.classList.add('colorInputGradientStopContainer');
        const offset = document.createElement('input');
        offset.classList.add('numberBox');
        offset.classList.add('colorInputGradientStopOffset');
        offset.type = 'number';
        offset.min = 0;
        offset.max = 100;
        offset.step = 1;
        offset.value = 0;
        offset.addEventListener('input', (e) => {
            if (Number(offset.value) < 0 || Number(offset.value) > 100) offset.value = Math.max(0, Math.min(100, Number(offset.value)));
            this.#oninput();
            this.#refreshBadge();
        });
        const color = document.createElement('input');
        color.classList.add('colorInputGradientStopColor');
        color.type = 'color';
        color.value = '#ffffff';
        color.addEventListener('input', (e) => {
            this.#oninput();
            this.#refreshBadge();
        });
        const remove = document.createElement('input');
        remove.classList.add('colorInputGradientStopRemove');
        remove.type = 'button';
        remove.value = 'X';
        remove.onclick = (e) => {
            if (this.#inputs.gradient.stops.length > 1) {
                item.remove();
                this.#inputs.gradient.stops.splice(this.#inputs.gradient.stops.indexOf(item), 1);
                this.#oninput();
                this.#refreshBadge();
            }
        };
        item.appendChild(offset);
        item.appendChild(color);
        item.appendChild(remove);
        this.#inputs.gradient.stops.push([offset, color]);
        this.#stopsContainer.appendChild(item);
        this.#oninput();
        this.#refreshBadge();
        return this.#inputs.gradient.stops.at(-1);
    }
    #refreshBadge() {
        if (this.#state.mode == 0) {
            this.#badge.style.background = this.#inputs.solid.input.value;
        } else if (this.#state.mode == 1) {
            switch (Number(this.#inputs.gradient.pattern.value)) {
                case 0:
                    this.#badge.style.background = `linear-gradient(${180 - Number(this.#inputs.gradient.angle.value)}deg${this.#inputs.gradient.stops.reduce((acc, curr) => acc + `, ${curr[1].value} ${curr[0].value}%`, '')})`;
                    break;
                case 1:
                    this.#badge.style.background = `radial-gradient(circle ${Number(this.#inputs.gradient.r.value) * 0.2}px at ${this.#inputs.gradient.x.value}% ${this.#inputs.gradient.y.value}%${this.#inputs.gradient.stops.reduce((acc, curr) => acc + `, ${curr[1].value} ${curr[0].value}%`, '')})`;
                    break;
                case 2:
                    this.#badge.style.background = `conic-gradient(from ${90 + Number(this.#inputs.gradient.angle.value)}deg at ${this.#inputs.gradient.x.value}% ${this.#inputs.gradient.y.value}%${this.#inputs.gradient.stops.reduce((acc, curr) => acc + `, ${curr[1].value} ${curr[0].value}%`, '')})`;
                    break;
            }
        }
    }

    set oninput(cb) {
        if (typeof cb != 'function') throw new TypeError('Callback function must be a function');
        this.#oninput = cb;
    }
    get oninput() {
        return this.#oninput;
    }

    get value() {
        if (this.#state.mode == 0) {
            return {
                mode: 0,
                value: this.#inputs.solid.input.value
            };
        } else if (this.#state.mode == 1) {
            return {
                mode: 1,
                value: {
                    type: Number(this.#inputs.gradient.pattern.value),
                    x: Number(this.#inputs.gradient.x.value) / 100,
                    y: Number(this.#inputs.gradient.y.value) / 100,
                    r: Number(this.#inputs.gradient.r.value) / 100,
                    angle: Number(this.#inputs.gradient.angle.value),
                    stops: this.#inputs.gradient.stops.map(inputs => [Number(inputs[0].value) / 100, inputs[1].value])
                }
            };
        }
    }
    set value(v) {
        (this.#inputs.modeSelectors[v.mode] ?? this.#inputs.modeSelectors[0]).onclick();
        switch (v.mode) {
            case 0:
                this.#inputs.solid.input.value = v.value;
                this.#oninput();
                this.#refreshBadge();
                break;
            case 1:
                this.#inputs.gradient.pattern.value = v.value.type;
                this.#inputs.gradient.x.value = v.value.x * 100;
                this.#inputs.gradient.y.value = v.value.y * 100;
                this.#inputs.gradient.r.value = v.value.r * 100;
                this.#inputs.gradient.angle.value = v.value.angle;
                this.#stopsContainer.innerHTML = '';
                this.#inputs.gradient.stops = [];
                for (let stop of v.value.stops) {
                    const inputs = this.#addGradientColorStop();
                    inputs[0].value = stop[0] * 100;
                    inputs[1].value = stop[1];
                }
                this.#oninput();
                this.#refreshBadge();
                break;
        }
    }
}

// upload/download
const uploadButton = document.getElementById('uploadButton');
const downloadButton = document.getElementById('downloadButton');
uploadButton.oninput = (e) => {
    if (!uploadButton.disabled && allowModification && uploadButton.files.length > 0 && uploadButton.files[0].name.endsWith('.soundtile')) {
        downloadButton.disabled = true;
        uploadButton.disabled = true;
        const reader = new FileReader();
        reader.onload = async (e) => {
            const tree = msgpack.decode(new Uint8Array(reader.result));
            if (tree.version > 0) {
                let promises = [];
                let curr;
                let stack = [tree.root];
                while (stack.length) {
                    curr = stack.pop();
                    if (curr.children !== undefined) {
                        for (let child of curr.children) stack.push(child);
                        continue;
                    }
                    if (curr.visualizer != null) {
                        let visualizer = curr.visualizer;
                        promises.push(new Promise((resolve, reject) => {
                            fflate.decompress(new Uint8Array(visualizer.buffer), {
                                consume: true
                            }, (err, data) => {
                                if (err) throw err;
                                visualizer.buffer = data.buffer;
                                resolve();
                            });
                        }));
                    }
                }
                await Promise.all(promises);
            }
            // jank
            for (let child of GroupTile.root.children) {
                child.destroy();
            }
            Visualizer.destroyAll();
            mediaControls.playing = false;
            playButton.checked = false;
            mediaControls.setTime(mediaControls.duration);
            GroupTile.root.tile.remove();
            GroupTile.root = new GroupTile(false);
            display.appendChild(GroupTile.root.tile);
            let dfs = (treenode) => {
                if (treenode.children !== undefined) {
                    let node = GroupTile.fromData(treenode);
                    for (let child of treenode.children) {
                        node.addChild(dfs(child));
                    }
                    return node;
                } else {
                    switch (treenode.type) {
                        case 'v':
                            return VisualizerTile.fromData(treenode);
                        case 'vi':
                            return VisualizerImageTile.fromData(treenode);
                        case 'vt':
                            return VisualizerTextTile.fromData(treenode);
                        case 'cp':
                            return ChannelPeakTile.fromData(treenode);
                        case 'i':
                            return ImageTile.fromData(treenode);
                        case 't':
                            return TextTile.fromData(treenode);
                        case 'b':
                            return BlankTile.fromData(treenode);
                        case 'grass':
                            return GrassTile.fromData(treenode);
                        default:
                            const tile = new TextTile();
                            tile.text = 'Unknown Tile';
                            tile.refresh();
                            return tile;
                    }
                }
            };
            GroupTile.root.addChild(dfs(tree.root));
            GroupTile.root.children[0].checkObsolescence();
            setTimeout(() => GroupTile.root.refresh(), 0);
            downloadButton.disabled = false;
            uploadButton.disabled = false;
        };
        reader.readAsArrayBuffer(uploadButton.files[0]);
        uploadButton.value = '';
    }
};
downloadButton.onclick = async (e) => {
    if (downloadButton.disabled) return;
    downloadButton.disabled = true;
    uploadButton.disabled = true;
    let dfs = (node) => {
        if (node.children !== undefined) {
            let treenode = {
                ...node.getData(),
                children: []
            };
            for (let child of node.children) {
                treenode.children.push(dfs(child));
            }
            return treenode;
        } else return node.getData();
    };
    const tree = {
        version: 1,
        root: dfs(GroupTile.root)
    };
    let promises = []
    let curr;
    let stack = [tree.root];
    while (stack.length) {
        curr = stack.pop();
        if (curr.children !== undefined) {
            for (let child of curr.children) stack.push(child);
            continue;
        }
        if (curr.visualizer != null) {
            let visualizer = curr.visualizer;
            promises.push(new Promise((resolve, reject) => {
                fflate.gzip(new Uint8Array(visualizer.buffer), {
                    level: 4
                }, (err, data) => {
                    if (err) throw err;
                    visualizer.buffer = data.buffer;
                    resolve();
                });
            }));
        }
    }
    await Promise.all(promises);
    const download = document.createElement('a');
    let current = new Date();
    download.download = `${current.getHours()}-${current.getMinutes()}_${current.getMonth()}-${current.getDay()}-${current.getFullYear()}.soundtile`;
    download.href = window.URL.createObjectURL(new Blob([msgpack.encode(tree)], { type: 'application/octet-stream' }));
    download.click();
    downloadButton.disabled = false;
    uploadButton.disabled = false;
};

// volume
const volumeControlInput = document.getElementById('volume');
const volumeControlThumb = document.getElementById('volumeThumb');
volumeControlInput.oninput = (e) => {
    globalVolume.gain.setValueAtTime(Number(volumeControlInput.value) / 100, audioContext.currentTime);
    volumeControlThumb.style.setProperty('--volume', Number(volumeControlInput.value) / 100);
    volumeControlInput.title = volumeControlInput.value + '%';
    window.localStorage.setItem('volume', volumeControlInput.value);
};
volumeControlInput.addEventListener('wheel', (e) => {
    volumeControlInput.value = Number(volumeControlInput.value) - Math.round(e.deltaY / 20);
    volumeControlInput.oninput();
}, { passive: true });
volumeControlInput.value = window.localStorage.getItem('volume') ?? 100;
volumeControlInput.oninput();

// media controls
const timeSeekInput = document.getElementById('seeker');
const timeSeekThumb = document.getElementById('seekerThumb');
const playButton = document.getElementById('playButton');
const timeDisplay = document.getElementById('timeDisplay');
const loopToggle = document.getElementById('loopToggle');
const mediaControls = {
    startTime: 0,
    duration: 0,
    currentTime: 0,
    playing: false,
    loop: (window.localStorage.getItem('loop') ?? true) == 'true' ? true : false,
    setTime: (t) => {
        if (!allowModification) return;
        mediaControls.currentTime = Number(t);
        timeSeekThumb.style.setProperty('--progress', (mediaControls.currentTime / mediaControls.duration) || 0);
        timeSeekInput.title = `${getTime(mediaControls.currentTime)}/${getTime(mediaControls.duration)}`;
        mediaControls.startTime = performance.now() - (mediaControls.currentTime * 1000);
        if (mediaControls.playing) Visualizer.startAll(mediaControls.currentTime);
    }
};
Visualizer.onUpdate = () => {
    mediaControls.duration = Visualizer.duration;
    timeSeekInput.max = mediaControls.duration;
    if (mediaControls.playing) Visualizer.startAll(mediaControls.currentTime);
    if (mediaControls.currentTime >= mediaControls.duration) {
        mediaControls.currentTime = mediaControls.duration;
        mediaControls.startTime = performance.now();
    }
    timeSeekThumb.style.setProperty('--progress', (mediaControls.currentTime / mediaControls.duration) || 0);
};
function getTime(s) {
    return `${Math.trunc(s / 60)}:${s % 60 < 10 ? '0' : ''}${Math.trunc(s) % 60}`;
};
setInterval(() => {
    let now = performance.now();
    if (mediaControls.currentTime >= mediaControls.duration) {
        if (mediaControls.duration == 0 || !mediaControls.loop) {
            mediaControls.playing = false;
            playButton.checked = false;
            mediaControls.setTime(mediaControls.duration);
        } else if (mediaControls.playing) {
            mediaControls.setTime(0);
        }
    }
    if (mediaControls.playing) {
        mediaControls.currentTime = (now - mediaControls.startTime) / 1000;
        timeSeekInput.value = mediaControls.currentTime;
        timeSeekThumb.style.setProperty('--progress', (mediaControls.currentTime / mediaControls.duration) || 0);
        timeSeekInput.title = `${getTime(mediaControls.currentTime)}/${getTime(mediaControls.duration)}`;
    } else {
        mediaControls.startTime = now - (mediaControls.currentTime * 1000);
    }
    timeDisplay.innerText = getTime(mediaControls.currentTime);
}, 20);
timeSeekInput.oninput = (e) => {
    mediaControls.setTime(timeSeekInput.value);
};
playButton.onclick = (e) => {
    if (!allowModification) return;
    mediaControls.playing = playButton.checked;
    if (mediaControls.currentTime >= mediaControls.duration) {
        mediaControls.currentTime = 0;
        mediaControls.startTime = performance.now();
    }
    if (mediaControls.playing) Visualizer.startAll(mediaControls.currentTime);
    else Visualizer.stopAll();
};
loopToggle.onclick = (e) => {
    mediaControls.loop = loopToggle.checked;
    window.localStorage.setItem('loop', mediaControls.loop);
};
loopToggle.checked = mediaControls.loop;

// tile source
const tileSourceTemplate = document.getElementById('tileSourceTemplate');
const tileSourceContainer = document.getElementById('tileSource');
tileSourceContainer.addEventListener('wheel', (e) => {
    tileSourceContainer.scrollBy(e.deltaY, 0);
});
function createTileSource(tileClass, img, alt) {
    const source = tileSourceTemplate.content.cloneNode(true).children[0];
    source.querySelector('.tileSourceImg').src = img;
    source.querySelector('.tileSourceImg').alt = alt;
    source.querySelector('.tileSourcePopup').innerText = alt;
    source.addEventListener('mousedown', (e) => {
        if (drag.dragging || e.button != 0) return;
        const tile = new tileClass();
        drag.tile = tile;
        const rect = source.getBoundingClientRect();
        drag.dragX = e.clientX - rect.left;
        drag.dragY = 5;
        drag.tile.tile.querySelector('.tileDrag').style.opacity = 1;
        drag.container.style.top = e.clientY - drag.dragY + 'px';
        drag.container.style.left = e.clientX - drag.dragX + 'px';
        drag.container.style.width = rect.width + 'px';
        drag.container.style.height = rect.height + 'px';
        drag.container.appendChild(tile.tile);
        drag.layoutPreview.style.display = 'flex';
        drag.dragging = true;
    });
    tileSourceContainer.appendChild(source);
};
createTileSource(VisualizerTile, './assets/visualizer-tile.png', 'New visualizer tile');
createTileSource(ChannelPeakTile, './assets/channelpeak-tile.png', 'New channel peak tile');
createTileSource(TextTile, './assets/text-tile.png', 'New text tile');
createTileSource(ImageTile, './assets/image-tile.png', 'New image tile');
createTileSource(VisualizerImageTile, './assets/visualizer-image-tile.png', 'New visualizer + image tile');
createTileSource(VisualizerTextTile, './assets/visualizer-text-tile.png', 'New visualizer + text tile');
createTileSource(BlankTile, './assets/blank-tile.png', 'New blank tile');
createTileSource(GrassTile, './assets/blank-tile.png', 'New grass tile');
tileSourceContainer.lastChild.style.display = 'none';

// tree editor
const tileModeButton = document.getElementById('tileMode');
const treeModeButton = document.getElementById('treeMode');
tileModeButton.onclick = (e) => {
    tileModeButton.disabled = true;
    treeModeButton.disabled = false;
    GroupTile.treeMode = false;
};
treeModeButton.onclick = (e) => {
    tileModeButton.disabled = false;
    treeModeButton.disabled = true;
    GroupTile.treeMode = true;
};
tileModeButton.disabled = true;

// keys and stuff
const dropdownButton = document.getElementById('dropdownTab');
document.addEventListener('keydown', (e) => {
    if (e.target.matches('input[type=text]') || e.target.matches('input[type=number]') || e.target.matches('textarea')) return;
    if (e.target.matches('input')) e.target.blur();
    const key = e.key.toLowerCase();
    switch (key) {
        case 'arrowleft':
            if (e.ctrlKey) break;
            e.preventDefault();
            mediaControls.setTime(Math.max(0, mediaControls.currentTime - 5));
            break;
        case 'arrowright':
            if (e.ctrlKey) break;
            e.preventDefault();
            mediaControls.setTime(Math.min(mediaControls.duration, mediaControls.currentTime + 5));
            break;
        case ' ':
        case 'p':
            if (e.ctrlKey) break;
            e.preventDefault();
            playButton.click();
            break;
        case 'h':
            if (e.ctrlKey) break;
            e.preventDefault();
            dropdownButton.click();
            if (e.shiftKey) dropdownButton.classList.toggle('hidden');
            break;
        case 't':
            if (e.ctrlKey) break;
            e.preventDefault();
            if (GroupTile.treeMode) tileModeButton.click();
            else treeModeButton.click();
            break;
        case 's':
            if (e.ctrlKey) {
                e.preventDefault();
                downloadButton.click();
            }
            break;
        case 'o':
            if (e.ctrlKey) {
                e.preventDefault();
                uploadButton.click();
            }
            break;
    }
});