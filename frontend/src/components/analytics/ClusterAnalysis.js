import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Info as InfoIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// K-means clustering implementation
const kMeans = (data, k, maxIterations = 100) => {
  const n = data.length;
  const dimensions = Object.keys(data[0]).length;
  
  // Initialize centroids randomly
  const centroids = Array(k).fill().map(() => {
    const centroid = {};
    Object.keys(data[0]).forEach(key => {
      const values = data.map(d => d[key]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      centroid[key] = min + Math.random() * (max - min);
    });
    return centroid;
  });
  
  let clusters = Array(n).fill(0);
  let iterations = 0;
  let changed = true;
  
  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;
    
    // Assign points to nearest centroid
    data.forEach((point, i) => {
      let minDist = Infinity;
      let newCluster = clusters[i];
      
      centroids.forEach((centroid, j) => {
        const dist = Object.keys(point).reduce((sum, key) => 
          sum + Math.pow(point[key] - centroid[key], 2), 0);
        
        if (dist < minDist) {
          minDist = dist;
          newCluster = j;
        }
      });
      
      if (newCluster !== clusters[i]) {
        clusters[i] = newCluster;
        changed = true;
      }
    });
    
    // Update centroids
    const newCentroids = Array(k).fill().map(() => ({}));
    const counts = Array(k).fill(0);
    
    data.forEach((point, i) => {
      const cluster = clusters[i];
      counts[cluster]++;
      
      Object.keys(point).forEach(key => {
        newCentroids[cluster][key] = (newCentroids[cluster][key] || 0) + point[key];
      });
    });
    
    centroids.forEach((centroid, i) => {
      if (counts[i] > 0) {
        Object.keys(centroid).forEach(key => {
          centroid[key] = newCentroids[i][key] / counts[i];
        });
      }
    });
  }
  
  return { clusters, centroids, iterations };
};

// DBSCAN implementation
const dbscan = (data, eps, minPts) => {
  const n = data.length;
  const clusters = Array(n).fill(-1); // -1 for unvisited
  let currentCluster = 0;
  
  const getNeighbors = (point, index) => {
    const neighbors = [];
    data.forEach((other, i) => {
      if (i !== index) {
        const dist = Object.keys(point).reduce((sum, key) =>
          sum + Math.pow(point[key] - other[key], 2), 0);
        if (Math.sqrt(dist) <= eps) {
          neighbors.push(i);
        }
      }
    });
    return neighbors;
  };
  
  const expandCluster = (point, neighbors, cluster) => {
    clusters[point] = cluster;
    
    let i = 0;
    while (i < neighbors.length) {
      const currentPoint = neighbors[i];
      
      if (clusters[currentPoint] === -1) {
        clusters[currentPoint] = cluster;
        
        const currentNeighbors = getNeighbors(data[currentPoint], currentPoint);
        if (currentNeighbors.length >= minPts) {
          neighbors.push(...currentNeighbors.filter(n => !neighbors.includes(n)));
        }
      }
      
      i++;
    }
  };
  
  data.forEach((point, i) => {
    if (clusters[i] === -1) {
      const neighbors = getNeighbors(point, i);
      
      if (neighbors.length < minPts) {
        clusters[i] = -2; // Noise
      } else {
        expandCluster(i, neighbors, currentCluster);
        currentCluster++;
      }
    }
  });
  
  return clusters;
};

// Hierarchical clustering implementation
const hierarchicalClustering = (data, k) => {
  const n = data.length;
  let clusters = data.map((_, i) => [i]);
  const distances = Array(n).fill().map(() => Array(n).fill(Infinity));
  
  // Initialize distances
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dist = Object.keys(data[i]).reduce((sum, key) =>
        sum + Math.pow(data[i][key] - data[j][key], 2), 0);
      distances[i][j] = distances[j][i] = Math.sqrt(dist);
    }
  }
  
  // Merge clusters until we have k clusters
  while (clusters.length > k) {
    let minDist = Infinity;
    let toMerge = [0, 1];
    
    // Find closest clusters
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        let maxDist = -Infinity;
        
        // Complete linkage
        clusters[i].forEach(pi => {
          clusters[j].forEach(pj => {
            maxDist = Math.max(maxDist, distances[pi][pj]);
          });
        });
        
        if (maxDist < minDist) {
          minDist = maxDist;
          toMerge = [i, j];
        }
      }
    }
    
    // Merge clusters
    clusters[toMerge[0]] = [...clusters[toMerge[0]], ...clusters[toMerge[1]]];
    clusters.splice(toMerge[1], 1);
  }
  
  // Convert to cluster assignments
  const assignments = Array(n).fill(0);
  clusters.forEach((cluster, i) => {
    cluster.forEach(point => {
      assignments[point] = i;
    });
  });
  
  return assignments;
};

// Gaussian Mixture Model implementation
const gmm = (data, k, maxIterations = 100, tolerance = 1e-4) => {
  const n = data.length;
  const d = Object.keys(data[0]).length;
  
  // Initialize parameters
  let weights = Array(k).fill(1/k);
  let means = Array(k).fill().map(() => {
    const mean = {};
    Object.keys(data[0]).forEach(key => {
      const values = data.map(d => d[key]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      mean[key] = min + Math.random() * (max - min);
    });
    return mean;
  });
  let covs = Array(k).fill().map(() => {
    const cov = {};
    Object.keys(data[0]).forEach(key => {
      cov[key] = 1.0;
    });
    return cov;
  });
  
  // Helper functions
  const multivarGaussian = (x, mean, cov) => {
    const diff = {};
    Object.keys(x).forEach(key => {
      diff[key] = x[key] - mean[key];
    });
    const exponent = -0.5 * Object.keys(diff).reduce((sum, key) =>
      sum + Math.pow(diff[key], 2) / cov[key], 0);
    const normalizer = Math.pow(2 * Math.PI, -d/2) *
      Math.pow(Object.values(cov).reduce((a, b) => a * b, 1), -0.5);
    return normalizer * Math.exp(exponent);
  };
  
  let oldLogLikelihood = -Infinity;
  let iterations = 0;
  
  while (iterations < maxIterations) {
    // E-step: compute responsibilities
    const resp = Array(n).fill().map(() => Array(k).fill(0));
    let logLikelihood = 0;
    
    data.forEach((point, i) => {
      let totalResp = 0;
      for (let j = 0; j < k; j++) {
        resp[i][j] = weights[j] * multivarGaussian(point, means[j], covs[j]);
        totalResp += resp[i][j];
      }
      for (let j = 0; j < k; j++) {
        resp[i][j] /= totalResp;
      }
      logLikelihood += Math.log(totalResp);
    });
    
    // Check convergence
    if (Math.abs(logLikelihood - oldLogLikelihood) < tolerance) {
      break;
    }
    oldLogLikelihood = logLikelihood;
    
    // M-step: update parameters
    const Nk = resp.reduce((sums, r) => {
      r.forEach((rij, j) => sums[j] += rij);
      return sums;
    }, Array(k).fill(0));
    
    // Update weights
    weights = Nk.map(nk => nk / n);
    
    // Update means
    means = Array(k).fill().map(() => ({}));
    data.forEach((point, i) => {
      for (let j = 0; j < k; j++) {
        Object.keys(point).forEach(key => {
          means[j][key] = (means[j][key] || 0) + resp[i][j] * point[key] / Nk[j];
        });
      }
    });
    
    // Update covariances
    covs = Array(k).fill().map(() => ({}));
    data.forEach((point, i) => {
      for (let j = 0; j < k; j++) {
        Object.keys(point).forEach(key => {
          const diff = point[key] - means[j][key];
          covs[j][key] = (covs[j][key] || 0) + resp[i][j] * diff * diff / Nk[j];
        });
      }
    });
    
    iterations++;
  }
  
  // Assign points to clusters
  const clusters = data.map((point, i) => {
    let maxProb = -Infinity;
    let cluster = 0;
    for (let j = 0; j < k; j++) {
      const prob = weights[j] * multivarGaussian(point, means[j], covs[j]);
      if (prob > maxProb) {
        maxProb = prob;
        cluster = j;
      }
    }
    return cluster;
  });
  
  return { clusters, means, covs, weights, iterations };
};

// Spectral clustering implementation
const spectralClustering = (data, k) => {
  const n = data.length;
  
  // Compute similarity matrix (RBF kernel)
  const sigma = 1.0;
  const similarity = Array(n).fill().map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const dist = Object.keys(data[i]).reduce((sum, key) =>
        sum + Math.pow(data[i][key] - data[j][key], 2), 0);
      const sim = Math.exp(-dist / (2 * sigma * sigma));
      similarity[i][j] = similarity[j][i] = sim;
    }
  }
  
  // Compute Laplacian matrix
  const degree = similarity.map(row => row.reduce((a, b) => a + b, 0));
  const laplacian = Array(n).fill().map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        laplacian[i][j] = 1 - similarity[i][j] / degree[i];
      } else {
        laplacian[i][j] = -similarity[i][j] / Math.sqrt(degree[i] * degree[j]);
      }
    }
  }
  
  // Find eigenvectors (power iteration method)
  const findEigenvectors = (matrix, numVectors) => {
    const vectors = [];
    let currentMatrix = matrix;
    
    for (let v = 0; v < numVectors; v++) {
      let vector = Array(n).fill().map(() => Math.random());
      let length = Math.sqrt(vector.reduce((sum, x) => sum + x * x, 0));
      vector = vector.map(x => x / length);
      
      // Power iteration
      for (let iter = 0; iter < 100; iter++) {
        const newVector = Array(n).fill(0);
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            newVector[i] += currentMatrix[i][j] * vector[j];
          }
        }
        length = Math.sqrt(newVector.reduce((sum, x) => sum + x * x, 0));
        vector = newVector.map(x => x / length);
      }
      
      vectors.push(vector);
      
      // Deflate matrix
      const vvt = Array(n).fill().map(() => Array(n).fill(0));
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          vvt[i][j] = vector[i] * vector[j];
        }
      }
      currentMatrix = currentMatrix.map((row, i) =>
        row.map((val, j) => val - vvt[i][j]));
    }
    
    return vectors;
  };
  
  // Get eigenvectors and cluster using k-means
  const eigenvectors = findEigenvectors(laplacian, k);
  const points = Array(n).fill().map((_, i) => {
    const point = {};
    eigenvectors.forEach((vec, j) => {
      point[`dim${j}`] = vec[i];
    });
    return point;
  });
  
  return kMeans(points, k).clusters;
};

export default function ClusterAnalysis({ data, config }) {
  const {
    numericalFields = [],
    defaultFields = numericalFields.slice(0, 2),
  } = config;

  const [selectedFields, setSelectedFields] = useState(defaultFields);
  const [clusteringMethod, setClusteringMethod] = useState('kmeans');
  const [numClusters, setNumClusters] = useState(3);
  const [eps, setEps] = useState(0.5);
  const [minPts, setMinPts] = useState(5);
  const [colorField, setColorField] = useState('');

  const normalizedData = useMemo(() => {
    // Min-max normalization
    const mins = {};
    const maxs = {};
    selectedFields.forEach(field => {
      mins[field] = Math.min(...data.map(d => d[field]));
      maxs[field] = Math.max(...data.map(d => d[field]));
    });

    return data.map(d => {
      const normalized = {};
      selectedFields.forEach(field => {
        normalized[field] = (d[field] - mins[field]) / (maxs[field] - mins[field]);
      });
      return normalized;
    });
  }, [data, selectedFields]);

  const clusters = useMemo(() => {
    switch (clusteringMethod) {
      case 'kmeans':
        return kMeans(normalizedData, numClusters).clusters;
      case 'dbscan':
        return dbscan(normalizedData, eps, minPts);
      case 'hierarchical':
        return hierarchicalClustering(normalizedData, numClusters);
      case 'gmm':
        return gmm(normalizedData, numClusters).clusters;
      case 'spectral':
        return spectralClustering(normalizedData, numClusters);
      default:
        return Array(data.length).fill(0);
    }
  }, [normalizedData, clusteringMethod, numClusters, eps, minPts]);

  const clusterStats = useMemo(() => {
    const stats = {};
    const uniqueClusters = [...new Set(clusters)];

    uniqueClusters.forEach(cluster => {
      const clusterPoints = data.filter((_, i) => clusters[i] === cluster);
      stats[cluster] = {
        size: clusterPoints.length,
        center: {},
        variance: {},
      };

      selectedFields.forEach(field => {
        const values = clusterPoints.map(d => d[field]);
        stats[cluster].center[field] = values.reduce((a, b) => a + b, 0) / values.length;
        stats[cluster].variance[field] = values.reduce((sum, val) =>
          sum + Math.pow(val - stats[cluster].center[field], 2), 0) / values.length;
      });
    });

    return stats;
  }, [data, clusters, selectedFields]);

  const handleExport = () => {
    const exportData = {
      clusters,
      stats: clusterStats,
      params: {
        method: clusteringMethod,
        numClusters,
        eps,
        minPts,
      },
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cluster_analysis.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      {/* Controls */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Clustering Method</InputLabel>
              <Select
                value={clusteringMethod}
                onChange={(e) => setClusteringMethod(e.target.value)}
              >
                <MenuItem value="kmeans">K-Means</MenuItem>
                <MenuItem value="dbscan">DBSCAN</MenuItem>
                <MenuItem value="hierarchical">Hierarchical</MenuItem>
                <MenuItem value="gmm">Gaussian Mixture Model</MenuItem>
                <MenuItem value="spectral">Spectral Clustering</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {clusteringMethod !== 'dbscan' && (
            <Grid item xs={12} md={4}>
              <Typography gutterBottom>Number of Clusters</Typography>
              <Slider
                value={numClusters}
                onChange={(_, value) => setNumClusters(value)}
                min={2}
                max={10}
                marks
                valueLabelDisplay="auto"
              />
            </Grid>
          )}
          {clusteringMethod === 'dbscan' && (
            <>
              <Grid item xs={12} md={4}>
                <Typography gutterBottom>Epsilon (ε)</Typography>
                <Slider
                  value={eps}
                  onChange={(_, value) => setEps(value)}
                  min={0.1}
                  max={2}
                  step={0.1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography gutterBottom>MinPts</Typography>
                <Slider
                  value={minPts}
                  onChange={(_, value) => setMinPts(value)}
                  min={2}
                  max={20}
                  marks
                  valueLabelDisplay="auto"
                />
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* Scatter Plot */}
      <Paper elevation={3} sx={{ p: 2, mb: 2, height: 400 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Cluster Visualization</Typography>
          <IconButton onClick={handleExport}>
            <DownloadIcon />
          </IconButton>
        </Box>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid />
            <XAxis
              type="number"
              dataKey={selectedFields[0]}
              name={selectedFields[0]}
            />
            <YAxis
              type="number"
              dataKey={selectedFields[1]}
              name={selectedFields[1]}
            />
            <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            {[...new Set(clusters)].map(cluster => (
              <Scatter
                key={cluster}
                name={`Cluster ${cluster}`}
                data={data.filter((_, i) => clusters[i] === cluster)}
                fill={`hsl(${(cluster + 1) * 137.508}deg, 70%, 50%)`}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </Paper>

      {/* Cluster Statistics */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Cluster Statistics
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Cluster</TableCell>
                <TableCell>Size</TableCell>
                {selectedFields.map(field => (
                  <React.Fragment key={field}>
                    <TableCell>{`${field} (Center)`}</TableCell>
                    <TableCell>{`${field} (Variance)`}</TableCell>
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(clusterStats).map(([cluster, stats]) => (
                <TableRow key={cluster}>
                  <TableCell>{cluster}</TableCell>
                  <TableCell>{stats.size}</TableCell>
                  {selectedFields.map(field => (
                    <React.Fragment key={field}>
                      <TableCell>
                        {stats.center[field].toFixed(3)}
                      </TableCell>
                      <TableCell>
                        {stats.variance[field].toFixed(3)}
                      </TableCell>
                    </React.Fragment>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
