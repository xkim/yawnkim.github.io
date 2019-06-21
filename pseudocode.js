var pseudoHtml = {};

function highlightReset(){
    document.querySelectorAll('#pseudocode ol>li').forEach( (x)=>{
        x.style.backgroundColor = 'inherit';
    })
}

function highlightLines(from, to, overwriting = true){
    if(overwriting)highlightReset();
    to = (typeof to !== 'undefined') ?  to : from;
    let sel = `#pseudocode ol>li:nth-child(n+${from}):nth-child(-n+${to})`;
    document.querySelectorAll(sel).forEach( (x)=>{
        x.style.backgroundColor = 'yellow';
    });
}

function loadPseudocode(name, extras){
    document.getElementById('pseudocode').innerHTML = pseudoHtml[name];
}

pseudoHtml.bfs = `
<h4 class="pc-name"> BFS (<i>G, w</i>)</h4>
<ol class="pseudocode-bfs">
<li class="line1">
    <b>for</b> each vertex <i>u&isin;  G.V &minus; </i>{<i>s</i>}
</li>
<li class="line2">
    &#8193; <i>u.color</i> = <small>WHITE</small>
</li>
<li class="line3">
    &#8193; <i>u.d</i> = &infin;
</li>
<li class="line4">
    &#8193; <i>u.&pi;</i> = NIL
</li>
<li class="line5">
    <i>s.color</i> = <small>GRAY</small>
</li>
<li class="line6">
    <i>s.d</i> = 0
</li>
<li class="line7">
    <i>s.&pi;</i> = NIL
</li>
<li class="line8">
    <i>Q</i> = &empty;
</li>
<li class="line9">
    E<small>NQUEUE</small>(<i>Q</i>, <i>s</i>)
</li>
<li class="line10">
    <b>while</b> <i>Q</i> &ne; &empty;
</li>
<li class="line11">
    &#8193; <i>u</i> = D<small>EQUEUE</small>(<i>Q</i>)
</li>
<li class="line12">
    &#8193; <b>for</b> each <i>v</i> &isin; <i>G.Adj</i>[<i>u</i>]
</li>
<li class="line13">
    &#8193;&#8193; <b>if</b> <i>v.color</i> == <small>WHITE</small>
</li>
<li class="line14">
    &#8193;&#8193;&#8193; <i>v.color</i> = <small>GRAY</small>
</li>
<li class="line15">
    &#8193;&#8193;&#8193; <i>v.d</i> = <i>u.d</i> + 1
</li>
<li class="line16">
    &#8193;&#8193;&#8193; <i>v.&pi;</i> = <i>u</i>
</li>
<li class="line17">
    &#8193;&#8193;&#8193; E<small>NQUEUE</small>(<i>Q</i>, <i>v</i>)
</li>
<li class="line18">
    &#8193; <i>u.color</i> = <small>BLACK</small>
</li>
</ol>
`;

pseudoHtml.dfs = `
    <h4 class="pc-name"> DFS (<i>G</i>)</h4>
    <ol class="pseudocode-bfs">
        <li class="line1">
            <b>for</b> each vertex <i>u</i> &isin; <i>G.V</i>
        </li>
        <li class="line2">
            &#8193; <i>u.color</i> = <small>WHITE</small>
        </li>
        <li class="line3">
            &#8193; <i>u.&pi;</i> = NIL
        </li>
        <li class="line4">
            <i>time</i> = 0
        </li>
        <li class="line5">
            <b>for</b> each vertex <i>u</i> &isin; <i>G.V</i>
        </li>
        <li class="line6">
            &#8193; <b>if</b> <i>u.color</i> == <small>WHITE</small>
        </li>
        <li class="line7">
            &#8193;&#8193; DFS-V<small>ISIT</small>(<i>G, v</i>)
        </li>
    </ol>
    <h4 class="pc-name"> DFS-V<small>ISIT</small>(<i>G, v</i>) </h4>
    <ol class="pseudocode-bfs">
        <li class="line11">
            <i>time</i> = <i>time</i> + 1
        </li>
        <li class="line12">
            <i>u.d</i> = <i>time</i>
        </li>
        <li class="line13">
            <i>u.color</i> = <small>GRAY</small>
        </li>
        <li class="line14">
            <b>for</b> each <i>v</i> &isin; <i>G.Adj</i>[<i>u</i>]
        </li>
        <li class="line15">
            &#8193; <b>if</b> <i>v.color</i> == <small>WHITE</small>
        </li>
        <li class="line16">
            &#8193;&#8193; <i>v.&pi;</i> = <i>u</i>
        </li>
        <li class="line17">
            &#8193;&#8193; DFS-V<small>ISIT</small>(<i>G, v</i>)
        </li>
        <li class="line18">
            <i>u.color</i> = <small>BLACK</small>
        </li>
        <li class="line19">
            <i>time</i> = <i>time</i> + 1
        </li>
        <li class="line20">
            <i>u.f</i> = <i>time</i>
        </li>
    </ol>
`

pseudoHtml.kruskal = `
<h4 class="pc-name"> MST-K<small>RUSKAL</small>(<i>G, w</i>)</h4>
<ol>
    <li class="line1">
        <i>A</i> = &empty;
    </li>
    <li class="line2">
        <b>for</b> each vertex <i>v&isin;  G.V</i>
    </li>
    <li class="line3">
        &#8193; M<small>AKE</small>-S<small>ET</small>(<i>v</i>)
    </li>
    <li class="line4">
        sort the edges of <i>G.E</i>, taken in nondecreasing order by weight
    </li>
    <li class="line5">
        <b>for</b> each edge (<i>u, v</i>) &isin; <i>G.E</i>, taken in nondecreasing order by weight
    </li>
    <li class="line6">
        &#8193; <b>if</b> F<small>IND</small>-S<small>ET</small>(<i>u</i>) &ne; F<small>IND</small>-S<small>ET</small>(<i>v</i>)
    </li>
    <li class="line7">
        &#8193;&#8193; <i>A</i> = <i>A</i> &cup; {(<i>u</i>, <i>v</i>)}
    </li>
    <li class="line8">
        &#8193;&#8193; U<small>NION</small>(<i>u</i>, <i>v</i>)
    </li>
    <li class="line9">
        <b>return</b> <i>A</i>
    </li>
</ol>`;

pseudoHtml.bellman = `
<h4 class="pc-name"> I<small>NITIALIZE</small>-S<small>INGLE</small>-S<small>OURCE</small>(<i>G, s</i>)</h4>
        <ol>
            <li class="line1">
                <b>for</b> each vertex <i>v</i> &isin; <i>G.V</i>
            </li>
            <li class="line2">
                &#8193; <i>v.d</i> = &infin;
            </li>
            <li class="line3">
                &#8193; <i>v.&pi;</i> = NIL
            </li>
            <li class="line4">
                <i>s.d</i> = 0
            </li>
        </ol>
        <h4 class="pc-name"> R<small>ELAX</small>(<i>u, v, w</i>)</h4>
        <ol>
            <li class="line1">
                <b>if</b> <i>v.d</i> > <i>u.d</i> + <i>w</i>(<i>u, v</i>)
            </li>
            <li class="line2">
                &#8193; <i>v.d</i> = <i>u.d</i> + <i>w</i>(<i>u, v</i>)
            </li>
            <li class="line3">
                &#8193; <i>v.&pi;</i> = <i>u</i>
            </li>
        </ol>

        <h4 class="pc-name"> B<small>ELLMAN</small>-F<small>ORD</small>(<i>G, w, s</i>)</h4>
        <ol>
            <li class="line1">
                I<small>NITIALIZE</small>-S<small>INGLE</small>-S<small>OURCE</small>(<i>G, s</i>)
            </li>
            <li class="line2">
                <b>for</b> <i>i</i> = 1 <b>to</b> |<i>G.V</i>| - 1
            </li>
            <li class="line3">
                &#8193; <b>for</b> each edge (<i>u, v</i>) &isin; <i>G.E</i>
            </li>
            <li class="line4">
                &#8193;&#8193; R<small>ELAX</small>(<i>u, v, w</i>)
            </li>
            <li class="line5">
                <b>for</b> each edge (<i>u, v</i>) &isin; <i>G.E</i>
            </li>
            <li class="line6">
                &#8193; <b>if</b> <i>v.d</i> > <i>u.d</i> + <i>w</i>(<i>u, v</i>)
            </li>
            <li class="line7">
                &#8193;&#8193; <b>return</b> <small>FALSE</small>
            </li>
            <li class="line8">
                <b>return</b> <small>TRUE</small>
            </li>
        </ol>
        `
pseudoHtml.dijkstra = `
<h4 class="pc-name"> I<small>NITIALIZE</small>-S<small>INGLE</small>-S<small>OURCE</small>(<i>G, s</i>)</h4>
        <ol>
            <li class="line1">
                <b>for</b> each vertex <i>v</i> &isin; <i>G.V</i>
            </li>
            <li class="line2">
                &#8193; <i>v.d</i> = &infin;
            </li>
            <li class="line3">
                &#8193; <i>v.&pi;</i> = NIL
            </li>
            <li class="line4">
                <i>s.d</i> = 0
            </li>
        </ol>
        <h4 class="pc-name"> R<small>ELAX</small>(<i>u, v, w</i>)</h4>
        <ol>
            <li class="line1">
                <b>if</b> <i>v.d</i> > <i>u.d</i> + <i>w</i>(<i>u, v</i>)
            </li>
            <li class="line2">
                &#8193; <i>v.d</i> = <i>u.d</i> + <i>w</i>(<i>u, v</i>)
            </li>
            <li class="line3">
                &#8193; <i>v.&pi;</i> = <i>u</i>
            </li>
        </ol>

        <h4 class="pc-name"> D<small>IJSKTRA</small>(<i>G, w, s</i>)</h4>
        <ol>
            <li class="line1">
                I<small>NITIALIZE</small>-S<small>INGLE</small>-S<small>OURCE</small>(<i>G, s</i>)
            </li>
            <li class="line2">
                <i>S</i> = &empty;
            </li>
            <li class="line3">
                <i>Q</i> = <i>G.V</i>
            </li>
            <li class="line4">
                <b>while</b> <i>Q</i> &ne; &empty;
            </li>
            <li class="line5">
                &#8193; <i>u</i> = E<small>XTRACT</small>-M<small>IN</small>(<i>Q</i>)
            </li>
            <li class="line6">
                &#8193; <i>S</i> = <i>S</i> &cup; {<i>u</i>}
            </li>
            <li class="line7">
                &#8193;&#8193; <b>for</b> each vertex <i>v</i> &isin; <i>G.Adj</i>[<i>u</i>]
            </li>
            <li class="line8">
                &#8193;&#8193;&#8193; R<small>ELAX</small>(<i>u, v, w</i>)
            </li>
        </ol>
`

pseudoHtml.floyd = `
<h4 class="pc-name"> F<small>LOYD</small>-W<small>ARSHALL</small>(<i>W</i>)</h4>
        <ol>
            <li class="line1">
                <i>n</i> = <i>W.rows</i>
            </li>
            <li class="line2">
                <i>D</i><sup>(0)</sup> = <i>W</i>
            </li>
            <li class="line3">
                <b>for</b> <i>k</i> = 1 <b>to</b> <i>n</i>
            </li>
            <li class="line4">
                &#8193; let <i>D</i><sup>(<i>k</i>)</sup> = (<i>d</i><span class="supsub"> <sup>(<i>k</i>)</sup><sub><i>ij</i></sub></span>) be a new <i>n</i> &times; <i>n</i> matrix
            </li>
            <li class="line5">
                &#8193; <b>for</b> <i>i</i> = 1 <b>to</b> <i>n</i>
            </li>
            <li class="line6">
                &#8193;&#8193; <b>for</b> <i>j</i> = 1 <b>to</b> <i>n</i>
            </li>
            <li class="line7">
                &#8193;&#8193;&#8193; <i>d</i><span class="supsub"> <sup>(<i>k</i>)</sup><sub><i>ij</i></sub></span> = min (<i>d</i><span class="supsub"> <sup>(<i>k-1</i>)</sup><sub><i>ij</i></sub></span>, <i>d</i><span class="supsub"> <sup>(<i>k-1</i>)</sup><sub><i>ik</i></sub></span> + <i>d</i><span class="supsub"> <sup>(<i>k-1</i>)</sup><sub><i>kj</i></sub></span>)
            </li>
            <li class="line8">
                <b>return</b> <i>D</i><sup>(<i>n</i>)</sup>
            </li>
        </ol>
`

pseudoHtml.prim = `
        <h4 class="pc-name"> MST-P<small>RIM</small>(<i>G, w, r</i>)</h4>
        <ol>
            <li class="line1">
                <b>for</b> each vertex <i>u</i> &isin; <i>G.V</i>
            </li>
            <li class="line2">
                &#8193; <i>u.key</i> = &infin;
            </li>
            <li class="line3">
                &#8193; <i>u.&pi;</i> = NIL
            </li>
            <li class="line4">
                <i>r.key</i> = 0
            </li>
            <li class="line5">
                <i>Q</i> = <i>G.V</i>
            </li>
            <li class="line6">
                <b>while</b> <i>Q</i> &ne; &empty;
            </li>
            <li class="line7">
                &#8193; <i>u</i> = E<small>XTRACT</small>-M<small>IN</small>(<i>Q</i>)
            </li>
            <li class="line8">
                &#8193; <b>for</b> each <i>v</i> &isin; <i>G.Adj</i>[<i>u</i>]
            </li>
            <li class="line9">
                &#8193;&#8193; <b>if</b> <i>v</i> &isin; <i>Q</i> and <i>w</i>(<i>u, v</i>) &lt; <i>v.key</i>
            </li>
            <li class="line10">
                &#8193;&#8193;&#8193; <i>v.&pi;</i> = u
            </li>
            <li class="line11">
                &#8193;&#8193;&#8193; <i>v.key</i> = <i>w</i>(<i>u, v</i>)
            </li>
        </ol>
`

pseudoHtml.none = `<p>Run an algorithm first</p>`;