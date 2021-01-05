#node 'node_modules/@angular/cli/bin/ng' serve --hmr --port 80
node --max_old_space_size=8192 'node_modules/@angular/cli/bin/ng' serve --host 0.0.0.0 --live-reload false --disableHostCheck true --port 80 --poll=2000
