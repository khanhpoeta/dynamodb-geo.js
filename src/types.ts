import {
  QueryCommandInput,
  GetCommandInput,
  PutCommandInput,
  BatchExecuteStatementCommandOutput,
  NativeAttributeValue,
  DeleteCommandInput,
  DeleteCommandOutput,
  QueryCommandOutput,
  GetCommandOutput,
  PutCommandOutput,
  UpdateCommandInput,
  UpdateCommandOutput,
} from '@aws-sdk/lib-dynamodb';

import S2 from '@radarlabs/s2';

export interface BatchWritePointOutput
  extends BatchExecuteStatementCommandOutput {}

export interface DeletePointInput {
  RangeKeyValue: NativeAttributeValue;
  GeoPoint: GeoPoint;
  DeleteItemInput?: DeleteCommandInput;
}
export interface DeletePointOutput extends DeleteCommandOutput {}

export class GeoPoint extends S2.LatLng {}
export interface GeoQueryInput {
  QueryInput?: QueryCommandInput;
}
export interface GeoQueryOutput extends QueryCommandOutput {}
export interface GetPointInput {
  RangeKeyValue: NativeAttributeValue;
  GeoPoint: GeoPoint;
  GetItemInput: GetCommandInput;
}
export interface GetPointOutput extends GetCommandOutput {}
export interface PutPointInput {
  RangeKeyValue: NativeAttributeValue;
  GeoPoint: GeoPoint;
  PutItemInput: PutCommandInput;
}
export interface PutPointOutput extends PutCommandOutput {}
export interface QueryRadiusInput extends GeoQueryInput {
  RadiusInMeter: number;
  CenterPoint: GeoPoint;
}
export interface QueryRadiusOutput extends GeoQueryOutput {}
export interface QueryRectangleInput extends GeoQueryInput {
  MinPoint: GeoPoint;
  MaxPoint: GeoPoint;
}
export interface QueryRectangleOutput extends GeoQueryOutput {}
export interface UpdatePointInput {
  RangeKeyValue: NativeAttributeValue;
  GeoPoint: GeoPoint;
  UpdateItemInput: UpdateCommandInput;
}
export interface UpdatePointOutput extends UpdateCommandOutput {}
