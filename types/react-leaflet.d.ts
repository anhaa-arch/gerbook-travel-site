import "react-leaflet";
import { Map as LeafletMap, TileLayer as LeafletTileLayer, Popup as LeafletPopup } from "leaflet";

declare module "react-leaflet" {
    import { ComponentType, RefAttributes, PropsWithChildren } from "react";
    import { LatLngExpression, MapOptions, TileLayerOptions } from "leaflet";

    // Extend MapContainerProps
    export interface MapContainerProps extends MapOptions {
        center?: LatLngExpression;
        zoom?: number;
        style?: React.CSSProperties;
        scrollWheelZoom?: boolean;
        whenCreated?: (map: any) => void;
        className?: string;
        children?: React.ReactNode;
    }

    // Extend TileLayerProps  
    export interface TileLayerProps extends TileLayerOptions {
        url: string;
        attribution?: string;
    }

    // Extend PopupProps
    export interface PopupProps {
        autoOpen?: boolean;
        children?: React.ReactNode;
    }
}
