package Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import DTO.OrderRequest;
import DTO.OrderResponse;
import Service.OrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    /**
     * Place a new order. The user is identified from the JWT cookie.
     */
    @PostMapping
    public ResponseEntity<?> placeOrder(@Valid @RequestBody OrderRequest request, Authentication auth) {
        try {
            String email = auth.getName();
            OrderResponse order = orderService.placeOrder(email, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get all orders for the authenticated user.
     * Optional query param: ?status=OPEN|PARTIAL|FILLED|CANCELLED
     */
    @GetMapping
    public ResponseEntity<?> getOrders(
            @RequestParam(required = false) String status,
            Authentication auth) {
        try {
            String email = auth.getName();
            List<OrderResponse> orders;
            if (status != null && !status.isEmpty()) {
                orders = orderService.getUserOrdersByStatus(email, status);
            } else {
                orders = orderService.getUserOrders(email);
            }
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Cancel an order by ID. Only the owner can cancel their own OPEN/PARTIAL orders.
     */
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId, Authentication auth) {
        try {
            String email = auth.getName();
            OrderResponse order = orderService.cancelOrder(email, orderId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
