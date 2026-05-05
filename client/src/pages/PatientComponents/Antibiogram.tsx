import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";

const API_URL = "http://localhost:7000/api/v1/antibiograms";

interface Antibiogram {
  _id: string;
  organism: string;
  antibiotics: {
    name: string;
    resistance: "susceptible" | "intermediate" | "resistant";
  }[];
  date: string;
  source?: string;
}

const Antibiogram = () => {
  const [antibiograms, setAntibiograms] = useState<Antibiogram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAntibiograms = async () => {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      try {
        const response = await fetch(API_URL, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch antibiogram data");
        }

        const data = await response.json();
        setAntibiograms(data.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAntibiograms();
  }, []);

  const getResistanceColor = (resistance: string) => {
    switch (resistance) {
      case "susceptible":
        return "bg-green-100 text-green-800 border-green-300";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "resistant":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="m-4 p-4 border-destructive/50 bg-destructive/10">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-destructive">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Antibiogram</h2>
        <p className="text-sm text-muted-foreground">
          Antibiotic susceptibility patterns for common pathogens
        </p>
      </div>

      {antibiograms.length === 0 ? (
        <Card className="p-8">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-2">
            <p className="text-muted-foreground">No antibiogram data available</p>
            <p className="text-sm text-muted-foreground">Antibiogram results will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {antibiograms.map((antibiogram) => (
            <Card key={antibiogram._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{antibiogram.organism}</CardTitle>
                    <CardDescription>
                      {new Date(antibiogram.date).toLocaleDateString()}
                      {antibiogram.source && ` - ${antibiogram.source}`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Antibiotic</TableHead>
                      <TableHead>Susceptibility</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {antibiogram.antibiotics.map((ab, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{ab.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${getResistanceColor(ab.resistance)} capitalize`}
                          >
                            {ab.resistance}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium text-muted-foreground mb-3">Legend</p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                Susceptible
              </Badge>
              <span className="text-sm text-muted-foreground">- Antibiotic is effective</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                Intermediate
              </Badge>
              <span className="text-sm text-muted-foreground">- Variable effectiveness</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                Resistant
              </Badge>
              <span className="text-sm text-muted-foreground">- Antibiotic not effective</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Antibiogram;
