/*
 * Copyright 2021-2024 Avaiga Private Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

import React, {CSSProperties, lazy, Suspense, useMemo} from 'react';
import {Data} from "plotly.js";
import {useClassNames, useDynamicJsonProperty, useDynamicProperty} from "../../utils/hooks";
import {TaipyBaseProps, TaipyHoverProps} from "./utils";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

const Plot = lazy(() => import("react-plotly.js"));

interface MetricProps extends TaipyBaseProps, TaipyHoverProps {
    type?: string
    min?: number
    max?: number
    value?: number
    defaultValue?: number
    delta?: number
    defaultDelta?: number
    threshold?: number
    defaultThreshold?: number
    format?: string
    formatDelta?: string
    testId?: string
    defaultLayout?: string;
    layout?: string;
    defaultStyle?: string;
    style?: string;
    width?: string | number;
    height?: string | number;
}

const emptyLayout = {} as Record<string, Record<string, unknown>>;
const defaultStyle = {position: "relative", display: "inline-block"};

const Metric = (props: MetricProps) => {
    const {
        width = "100%",
        height
    } = props;
    const metricValue = useDynamicProperty(props.value, props.defaultValue, 0)
    const metricThresholdValue = useDynamicProperty(props.threshold, props.defaultThreshold, undefined)
    const metricDelta = useDynamicProperty(props.delta, props.defaultDelta, undefined)
    const className = useClassNames(props.libClassName, props.dynamicClassName, props.className);
    const baseLayout = useDynamicJsonProperty(props.layout, props.defaultLayout || "", emptyLayout);
    const baseStyle = useDynamicJsonProperty(props.style, props.defaultStyle || "", defaultStyle);

    const deltaValueSuffix = useMemo(() => {
        switch (props.formatDelta) {
            case "%.2f%%":
                return "%";
            default:
                return "";
        }
    }, [props.formatDelta]);

    const formatType = useMemo(() => {
        switch (props.format) {
            case "%.2f%%":
                return "%";
            default:
                return "";
        }
    }, [props.format]);

    const metricType = useMemo(() => {
        switch (props.type) {
            case "circular":
                return "angular";
            case "linear":
                return "bullet";
            default:
                return "angular";
        }
    }, [props.type]);

    const extendedDelta = useMemo(() => {
        const refValue = typeof metricValue === 'number' && typeof metricDelta === 'number' ? metricValue - metricDelta : undefined;
        return {
            reference: refValue,
            suffix: deltaValueSuffix,
        };
    }, [metricValue, metricDelta, deltaValueSuffix]);

    const data = useMemo(() => ([
        {
            domain: {x: [0, 1], y: [0, 1]},
            value: metricValue,
            type: "indicator",
            mode: "gauge+number+delta",
            number: {
                suffix: formatType
            },
            delta: extendedDelta,
            gauge: {
                axis: {range: [props.min, props.max]},
                shape: metricType,
                threshold: {
                    line: {color: "red", width: 4},
                    thickness: 0.75,
                    value: metricThresholdValue
                }
            },
        }
    ]), [metricValue, formatType, extendedDelta, props.min, props.max, metricType, metricThresholdValue]);

    const layout = useMemo(() => {
      return {...baseLayout};
    }, [baseLayout]);

    const style = useMemo(
        () =>
            height === undefined
                ? ({ ...baseStyle, width: width } as CSSProperties)
                : ({ ...baseStyle, width: width, height: height } as CSSProperties),
        [baseStyle, height, width]
    );

    return (
        <Box data-testid={props.testId} className={className}>
            <Suspense fallback={<Skeleton key="skeleton"/>}>
                <Plot
                    data={data as Data[]}
                    layout={layout}
                    style={style}
                />
            </Suspense>
        </Box>
    );
}

export default Metric;
