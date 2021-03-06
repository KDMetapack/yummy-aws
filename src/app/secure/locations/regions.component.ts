import {Component, OnInit} from '@angular/core';
import {LocationService} from '../../service/location.service';
import {Region} from '../../model/location';
import {NgProgress} from '@ngx-progressbar/core';
import {Router} from '@angular/router';
import {CacheService} from '@ngx-cache/core';
import {ToastrService} from 'ngx-toastr';
import {NGXLogger} from 'ngx-logger';
import {GeoPoint} from '../../model/geopoint';

@Component({
    selector: 'app-regions',
    templateUrl: './regions.component.html',
    styleUrls: []
})
export class RegionsComponent implements OnInit {


    debug = false;
    regions: Array<Region>;
    regionTree: Array<Object>;
    newRegion: Region;
    rootCode = 'www';
    months: Array<String> = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    constructor(
        private locationService: LocationService,
        private progress: NgProgress,
        private readonly cache: CacheService,
        private router: Router,
        private toastr: ToastrService,
        private log: NGXLogger
    ) {
    }

    ngOnInit() {
        this.log.info('ngOnInit');
        this.newRegion = new Region();
        this.onRefresh();
    }
    indexTracker(index: number, value: any) {
        return index;
    }

    onRefresh(): void {
        this.locationService.getRegions().then((data) => {
            this.log.info('Received');
            this.regions = data;
            this.regionTree = this.buildTree(this.regions);
        })
    }

    onToggleSeason(): void {
        if (Array.isArray(this.newRegion.season)) {
            this.newRegion.season = null;
        } else {
            this.newRegion.season = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }
    }

    onSubmitRegion(): void {
        this.log.info('Submitting new region');
        this.locationService.putRegion(this.newRegion).then((data) => {
            this.toastr.info('New Region ' + this.newRegion.name + 'saved', 'Success');
        })
    }

    // todo would be nice to share with places-detail.component
    onChangeCoordinates(event: any) {
        // https://github.com/perfectline/geopoint
        if (event.target.value) {
            this.newRegion.coordinates = new Array(2);
            this.newRegion.coordinates[0] =  Number(event.target.value.split(/[\s]+/)[1]);
            this.newRegion.coordinates[1] =  Number(event.target.value.split(/[\s]+/)[0]);
        } else {
            // clean
        }
    }
    getDegrees(): string {
        if (Array.isArray(this.newRegion.coordinates) && this.newRegion.coordinates.length > 1) {
            const point = new GeoPoint(this.newRegion.coordinates[0],this.newRegion.coordinates[1]);
            return point.getLatLonDeg();
        } else {
            return "No coordinates defined";
        }
    }


    selecedItemsChanged(items: any[]): void {
        this.log.info(JSON.stringify(items));
    }

    buildTree(array: Array<Region>, parent?: Region, tree?: Array<Region>): Array<Object> {

        tree = typeof tree !== 'undefined' ? tree : [];
        parent = typeof parent !== 'undefined' ? parent : {code: this.rootCode, name: 'World'};
        //console.log(array);
        let children = array.filter((child) => {
            return child.parentCode == parent.code;
        });

        if (children && children.length > 0) {
            if (parent.code == this.rootCode) {
                tree = children;
            } else {
                parent['children'] = children;
            }
            children.forEach((child) => {
                this.buildTree(array, child)
            });
        }
        /* else {
                    parent['children'] = [];
                }*/

        return tree;
    }

}