disruptions:

1. modify connections file to have specific routes instead of just line.
   need to understand which route is taken e.g. beckton -> canning town change -> woolwich arsenal

- could add more metadata instead of just line (e.g. {line: 'dlr', routes: ['Tower Gateway-Beckton', 'Bank-Woolwich Arsenal']}).
- when reading the results, check the route metadata and if different between interchange line and next line, that signifies a change within the same line

caveats:

- would need to change dijkstras to favour same route nodes else results will show multiple changes on the same line e.g.
  blackwall -> change route -> east india -> change route -> canning town
- this issue wouldn't occur if there were weighted links to signify that travel times would be a lot longer when changing trains

2. read the disruptions from TFL API. process the following closure types:

- "Part Closure"
  'Central Line: Service operating between Loughton and Liverpool Street, between Newbury Park and Liverpool Street via Hainault and between White City and Ealing Broadway / West Ruislip at a reduced frequency. No service on the rest of the line due to strike action by the RMT. Trains are not calling at Bethnal Green and South Woodford.'

  2.1. extract the line name. between X and Y are still valid routes. No service on the rest of the line would require the edges which aren't in between X and Y to be removed

  2.2. Remove add edges for stations "Trains are not calling at ... X and Y"

  2.3. between X and Y via Z. Need to remove the route which is not via Z. (NEED TO UNDERSTAND: what are the route names so they can be used as part of step 1)

(disruptions also have Zone 1 stations as starting points which makes it hard to tell which edges to sever as they're not in the graph)

need some way of representing order of stops between X and Y. could use an array or compose the graph and sever links accordingly.
