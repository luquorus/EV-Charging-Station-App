/// Represents a charging port at a station
class Port {
  final String type;
  final int quantity;
  final int powerKw;

  const Port({
    required this.type,
    required this.quantity,
    required this.powerKw,
  });

  factory Port.fromJson(Map<String, dynamic> json) {
    return Port(
      type: json['type'] ?? '',
      quantity: json['quantity'] ?? 0,
      powerKw: json['powerKw'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
    'type': type,
    'quantity': quantity,
    'powerKw': powerKw,
  };
}

